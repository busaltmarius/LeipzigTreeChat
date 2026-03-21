import type { IQanaryMessage } from "@leipzigtreechat/qanary-component-helpers";
import {
  createAnnotationInKnowledgeGraph,
  getEndpoint,
  getInGraph,
  QANARY_PREFIX,
  selectSparql,
} from "@leipzigtreechat/shared";
import {
  ENTITY_TYPE_CONFIGS,
  type EntityType,
  extractEntityTypeFromUri,
  generateEntityQuery,
  getEntityTypeConfig,
} from "./entity-types";
import { similarity } from "./fuzzy-matching";
import type { DisambiguationResult, NerAnnotation } from "./types";

// Config Part

// SPARQL endpoint for querying the knowledge base (domain-specific data)
// This is separate from the Qanary triplestore endpoint which comes from the message
const KNOWLEDGE_BASE_ENDPOINT = "http://localhost:8000";
const COMPONENT_NAME = "leipzigtreechat:component:disambiguation";

function hasRawdataUrl(value: unknown): value is { rawdata: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "rawdata" in value &&
    typeof (value as { rawdata?: unknown }).rawdata === "string"
  );
}

const FUZZY_THRESHOLDS: Record<EntityType, number> = {
  TREE: 0.7,
  KITA: 0.75,
  DISTRICT: 0.6,
  /**
  ZIP: parseFloat("0.90"),
  CITY: parseFloat("0.90"),
  JAHR: parseFloat("0.90"),
  */
};

export async function fetchNerAnnotations(message: IQanaryMessage, questionUri: string): Promise<NerAnnotation[]> {
  const endpoint = "http://localhost:8890/sparql/";
  const graphUri = getInGraph(message);

  if (!endpoint || !graphUri) {
    console.warn("No endpoint or graph URI found in message");
    return [];
  }

  const query = `
    PREFIX qa:  <${QANARY_PREFIX}>
    PREFIX oa:  <http://www.w3.org/ns/openannotation/core/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?annotation ?target ?spotBody ?score ?start ?end
    WHERE {
      GRAPH <${graphUri}> {
        ?annotation  a              qa:AnnotationOfSpotInstance ;
                     oa:hasBody     ?spotBody ;
                     oa:score       ?score ;
                     oa:annotatedBy <urn:qanary-component-nerd-simple> ;
                     oa:hasTarget   ?target .

        ?target      oa:hasSelector ?selector .

        ?selector    a        oa:TextPositionSelector ;
                     oa:start ?start ;
                     oa:end   ?end .
      }
    }
  `;

  console.warn("#######################################################");
  console.warn("fetching Annotations for: ");
  console.warn("Endpoint:    ", endpoint);
  console.warn("Graph URI:   ", graphUri);
  console.warn("Question URI:", questionUri);
  console.warn("SPARQL Query:\n", query);

  const bindings = (await selectSparql(endpoint, query)) as any[];

  console.log(`Result: ${bindings.length} binding(s) found`);
  if (bindings.length > 0) {
    console.log("Found Entity:", JSON.stringify(bindings[0], null, 2));
  } else {
    console.warn("Nothing found — check graph URI, question URI and annotatedBy URI");
  }
  console.log("#######################################################");

  // Fetch question to get the found entities
  let questionText = "";
  try {
    const metaResponse = await fetch(questionUri);
    const meta = (await metaResponse.json()) as unknown;

    if (!hasRawdataUrl(meta)) {
      throw new Error("Question metadata does not contain a valid rawdata URL");
    }

    const rawUrl = meta.rawdata;

    console.log(`Fetching raw question from: ${rawUrl}`);
    const rawResponse = await fetch(rawUrl);
    questionText = await rawResponse.text();
    console.log(`Question text: "${questionText}"`);
  } catch (e) {
    console.warn("Could not fetch question text:", e);
  }

  return bindings.map((binding: any) => {
    const start = parseInt(binding.start?.value ?? "0");
    const end = parseInt(binding.end?.value ?? "0");
    const exactQuote = questionText ? questionText.substring(start, end) : "";

    // Parse the JSON body to extract entity type
    let entityTypeString = "";
    try {
      const bodyValue = binding.spotBody?.value ?? "";
      const parsed = JSON.parse(bodyValue);
      entityTypeString = parsed.type ?? "";
    } catch (e) {
      console.warn(`Failed to parse spot body JSON: ${binding.spotBody?.value}`, e);
      entityTypeString = "";
    }

    console.log(`Extracted Entity: "${exactQuote}" [${start}, ${end}] with type: ${entityTypeString}`);

    return {
      annotationUri: binding.annotation?.value ?? "",
      spotResourceUri: binding.target?.value ?? "",
      entityType: entityTypeString,
      score: parseFloat(binding.score?.value ?? "0"),
      exactQuote,
      start,
      end,
      questionUri,
    };
  });
}

//  Disambiguates a NER annotation by finding the best matching entity in the KB

export async function disambiguate(annotation: NerAnnotation): Promise<DisambiguationResult | null> {
  // annotation.entityType is now a plain string (e.g., "CITY", "DISTRICT")
  // from the JSON body, not a full URI
  let entityType: EntityType | null = null;

  // Try to use the string directly if it's a valid EntityType
  if (annotation.entityType in ENTITY_TYPE_CONFIGS) {
    entityType = annotation.entityType as EntityType;
  } else {
    // Fall back to old URI extraction for backwards compatibility
    entityType = extractEntityTypeFromUri(annotation.entityType);
  }

  if (!entityType) {
    console.warn(`Unsupported or invalid entity type: ${annotation.entityType}`);
    return null;
  }

  const fuzzyThreshold = FUZZY_THRESHOLDS[entityType] ?? 0.75;
  const query = generateEntityQuery(entityType);

  const bindings = (await selectSparql(KNOWLEDGE_BASE_ENDPOINT, query)) as any[];

  if (bindings.length === 0) {
    console.warn(`Knowledge base returned no candidates for ${entityType} entity: "${annotation.exactQuote}"`);
    return null;
  }

  // Score each candidate with fuzzy similarity
  const scored = bindings
    .map((binding: any) => ({
      entityUrn: binding.urn?.value ?? "",
      label: binding.name?.value ?? "",
      similarity: similarity(annotation.exactQuote, binding.name?.value ?? ""),
    }))
    .filter((c) => c.similarity >= fuzzyThreshold)
    .sort((a, b) => b.similarity - a.similarity);

  if (scored.length === 0) {
    const bestMatch = bindings
      .map((binding) => ({
        label: binding.name?.value ?? "",
        similarity: similarity(annotation.exactQuote, binding.name?.value ?? ""),
      }))
      .sort((a, b) => b.similarity - a.similarity)[0];

    console.warn(
      `No fuzzy match found for ${entityType}: "${annotation.exactQuote}" ` +
        `(best match is "${bestMatch?.label ?? "none"}" with similarity ${bestMatch?.similarity.toFixed(2)} which is below threshold ${fuzzyThreshold})`
    );
    return null;
  }

  const best = scored[0];
  if (!best) {
    return null;
  }

  // Kombinierter Score wird oft benutzt, könnte man noch einabuen. confidence * similarity
  // const combinedScore = annotation.score * best.similarity;

  console.log(
    `  ${entityType}: "${annotation.exactQuote}" → "${best.label}" ` +
      `(similarity: ${best.similarity.toFixed(2)}, NER: ${annotation.score.toFixed(2)}, combined: ${best.similarity.toFixed(2)})`
  );

  return {
    entityUrn: best.entityUrn,
    label: best.label,
    score: best.similarity,
  };
}

//Write Disambiguation Annotation
export async function writeDisambiguationAnnotation(
  message: IQanaryMessage,
  annotation: NerAnnotation,
  result: DisambiguationResult
): Promise<void> {
  try {
    console.log("[writeDisambiguationAnnotation] Writing annotation with details:", {
      entityQuote: annotation.exactQuote,
      entityUrn: result.entityUrn,
      start: annotation.start,
      end: annotation.end,
      confidence: result.score,
    });

    await createAnnotationInKnowledgeGraph({
      message,
      componentName: COMPONENT_NAME,
      annotation: {
        value: result.entityUrn,
        range: {
          start: annotation.start,
          end: annotation.end,
        },
        confidence: result.score,
      },
      annotationType: `<${QANARY_PREFIX}AnnotationOfInstance>`,
    });

    console.log(`Disambiguated "${annotation.exactQuote}" → <${result.entityUrn}> (score: ${result.score.toFixed(2)})`);
  } catch (error) {
    console.error(`Failed to write disambiguation annotation for "${annotation.exactQuote}":`, error);
  }
}
