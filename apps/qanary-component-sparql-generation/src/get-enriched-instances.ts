import type { IQanaryMessage } from "@leipzigtreechat/qanary-component-helpers";
import { getEndpoint, getOutGraph, QANARY_PREFIX, selectSparql } from "@leipzigtreechat/shared";

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
 * Gets all AnnotationOfInstance annotations with their corresponding types from AnnotationOfSpotInstance
 * Links them by shared text positions (start/end)
 *
 * @param message - The Qanary message containing endpoint and graph information
 * @returns Array of enriched instances with type information
 */
export async function getEnrichedInstances(message: IQanaryMessage): Promise<EnrichedInstance[]> {
  const endpoint = getEndpoint(message);
  const outGraph = getOutGraph(message);

  if (!endpoint || !outGraph) {
    console.warn("Missing endpoint or graph in message");
    return [];
  }

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

  try {
    const bindings = (await selectSparql(endpoint, query)) as any[];

    console.log(`Found ${bindings.length} enriched instance(s)`);

    return bindings.map((binding: any) => {
      const start = parseInt(binding.start?.value ?? "0");
      const end = parseInt(binding.end?.value ?? "0");

      // Parse the spot body JSON to extract entity type
      let entityType = "UNKNOWN";
      try {
        const spotBody = JSON.parse(binding.spotBody?.value ?? "{}");
        entityType = spotBody.type ?? "UNKNOWN";
      } catch (e) {
        console.warn(`Could not parse spot body: ${binding.spotBody?.value}`);
      }

      return {
        instanceUri: binding.instanceUri?.value ?? "",
        entityUrn: binding.instanceBody?.value ?? "",
        entityType,
        exactQuote: "", // We don't have the original text, would need additional query
        start,
        end,
        instanceConfidence: parseFloat(binding.instanceScore?.value ?? "0"),
        spotConfidence: parseFloat(binding.spotScore?.value ?? "0"),
      };
    });
  } catch (error) {
    console.error("Error querying enriched instances:", error);
    return [];
  }
}
