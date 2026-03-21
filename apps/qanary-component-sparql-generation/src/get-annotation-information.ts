import type { IQanaryMessage } from "@leipzigtreechat/qanary-component-helpers";
import {
  getInGraph,
  getOutGraph,
  getQuestionUri,
  QANARY_PREFIX,
  selectSparql,
} from "@leipzigtreechat/shared";
import {
  KNOWN_RELATION_TYPES,
  type KnownRelationType,
} from "../../qanary-component-relation-detection/src/relation-types.ts";

const ANNOTATION_TRIPLESTORE_ENDPOINT = "http://localhost:8890/sparql/";

/**
 * Represents an AnnotationOfInstance enriched with its corresponding type from AnnotationOfSpotInstance
 */
export interface EnrichedInstance {
  /** The URI of the AnnotationOfInstance */
  instanceUri: string;
  /** The entity URN (body of AnnotationOfInstance) */
  entityUrn: string;
  /** The entity type from the corresponding AnnotationOfSpotInstance */
  entityType: string;
  /** The exact text that was annotated */
  exactQuote: string;
  /** Start position in the question text */
  start: number;
  /** End position in the question text */
  end: number;
  /** Confidence score from AnnotationOfInstance */
  instanceConfidence: number;
  /** Confidence score from AnnotationOfSpotInstance */
  spotConfidence: number;
}

/**
 * All annotation information required for SPARQL generation
 */
export interface AnnotationInformation {
  /** The detected and validated relation type */
  relationType: KnownRelationType | "";
  /** All instances with their corresponding entity types */
  instances: EnrichedInstance[];
}

/**
 * Checks if a string is a valid relation type
 */
const isValidRelationType = (relationType: string): relationType is KnownRelationType => {
  return KNOWN_RELATION_TYPES.includes(relationType as KnownRelationType);
};

/**
 * Gets the relation type from AnnotationOfRelation
 *
 * @param message - The Qanary message containing endpoint and graph information
 * @returns The validated relation type, or empty string if not found or invalid
 */
async function getRelationType(message: IQanaryMessage): Promise<KnownRelationType | ""> {
  const inGraph = getInGraph(message);
  const questionUri = await getQuestionUri(message);

  if (!inGraph || !questionUri) {
    console.warn("Missing inGraph or questionUri for relation query");
    return "";
  }

  const getRelationQuery = `
		PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
		SELECT ?relationBody WHERE {
			GRAPH <${inGraph}> {
				?annotation a <${QANARY_PREFIX}AnnotationOfRelation> ;
									oa:hasTarget <${questionUri}> ;
									oa:hasBody ?relationBody .
			}
		}
	`;

  try {
    const relationResponse = await selectSparql<{ relationBody: { value: string } }>(
      ANNOTATION_TRIPLESTORE_ENDPOINT,
      getRelationQuery
    );
    const rawRelationType = relationResponse[0]?.relationBody.value ?? "";

    if (!rawRelationType) {
      console.warn("No relation found for question:", questionUri);
      return "";
    }

    const normalizedRelationType = rawRelationType.trim().toUpperCase();

    if (!isValidRelationType(normalizedRelationType)) {
      console.warn("Invalid relation type found:", rawRelationType, "normalized:", normalizedRelationType);
      return "";
    }

    console.log("Found valid relation type:", normalizedRelationType);
    return normalizedRelationType;
  } catch (error) {
    console.error("Error fetching relation:", error);
    return "";
  }
}

/**
 * Gets all AnnotationOfInstance annotations with their corresponding types from AnnotationOfSpotInstance
 * Links them by shared text positions (start/end)
 *
 * @param message - The Qanary message containing endpoint and graph information
 * @returns Array of enriched instances with type information
 */
async function getEnrichedInstances(message: IQanaryMessage): Promise<EnrichedInstance[]> {
  const outGraph = getOutGraph(message);

  if (!outGraph) {
    console.warn("Missing outGraph in message");
    return [];
  }

  console.log("[getEnrichedInstances] Query parameters:", {
    endpoint: ANNOTATION_TRIPLESTORE_ENDPOINT,
    outGraph,
  });

  const query = `
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>

SELECT ?instanceUri ?instanceBody ?spotBody ?start ?end ?instanceScore ?spotScore
WHERE {
  GRAPH <${outGraph}> {
    # Get AnnotationOfInstance
    ?instanceUri a ?instanceType ;
                 oa:hasBody ?instanceBody ;
                 oa:score ?instanceScore ;
                 oa:hasTarget ?target1 .

    FILTER(?instanceType = <${QANARY_PREFIX}AnnotationOfInstance>)
    
    ?target1 oa:hasSelector ?selector1 .
    ?selector1 oa:start ?start ;
               oa:end ?end .
    
    # Get corresponding AnnotationOfSpotInstance with same text positions
    ?spotUri a ?spotType ;
             oa:hasBody ?spotBody ;
             oa:score ?spotScore ;
             oa:hasTarget ?target2 .

    FILTER(?spotType = <${QANARY_PREFIX}AnnotationOfSpotInstance>)
    
    ?target2 oa:hasSelector ?selector2 .
    ?selector2 oa:start ?start ;
               oa:end ?end .
  }
}
`;

  console.log("[getEnrichedInstances] Executing SPARQL query:\n", query);

  try {
    const bindings = (await selectSparql(ANNOTATION_TRIPLESTORE_ENDPOINT, query)) as any[];

    console.log(`[getEnrichedInstances] Found ${bindings.length} enriched instance(s)`);
    
    if (bindings.length > 0) {
      console.log("[getEnrichedInstances] First enriched instance:", JSON.stringify(bindings[0], null, 2));
    } else {
      console.warn("[getEnrichedInstances] No enriched instances found. This means either:");
      console.warn("  - No AnnotationOfInstance annotations exist in the graph");
      console.warn("  - No AnnotationOfSpotInstance annotations exist in the graph");
      console.warn("  - The text positions (start/end) do not match between them");
    }

    return bindings.map((binding: any) => {
      const start = parseInt(binding.start?.value ?? "0");
      const end = parseInt(binding.end?.value ?? "0");

      // Parse the spot body JSON to extract entity type
      let entityType = "UNKNOWN";
      let exactQuote = "";
      try {
        const spotBody = JSON.parse(binding.spotBody?.value ?? "{}");
        entityType = spotBody.type ?? "UNKNOWN";
        exactQuote = spotBody.entity ?? "";
      } catch (e) {
        console.warn(`Could not parse spot body: ${binding.spotBody?.value}`);
      }

      return {
        instanceUri: binding.instanceUri?.value ?? "",
        entityUrn: binding.instanceBody?.value ?? "",
        entityType,
        exactQuote,
        start,
        end,
        instanceConfidence: parseFloat(binding.instanceScore?.value ?? "0"),
        spotConfidence: parseFloat(binding.spotScore?.value ?? "0"),
      };
    });
  } catch (error) {
    console.error("[getEnrichedInstances] Error querying enriched instances:", error);
    return [];
  }
}

/**
 * Gets all required annotation information: relation type and instances with their types
 *
 * @param message - The Qanary message containing endpoint and graph information
 * @returns Annotation information including relation type and enriched instances
 */
export async function getAnnotationInformation(message: IQanaryMessage): Promise<AnnotationInformation> {
  const [relationType, instances] = await Promise.all([getRelationType(message), getEnrichedInstances(message)]);

  return {
    relationType,
    instances,
  };
}
