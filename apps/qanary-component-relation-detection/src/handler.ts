import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  createClarificationAnnotation,
  generateClarificationQuestion,
  getEndpoint,
  getOutGraph,
  getQuestion,
  getQuestionUri,
  updateSparql,
} from "@leipzigtreechat/qanary-component-helpers";
import { type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";
import { classifyRelationType } from "./relation-classifier.ts";
import { KNOWN_RELATION_TYPES, type KnownRelationType } from "./relation-types.ts";

/**
 * Confidence threshold below which a clarification question is generated.
 */
const CLARIFICATION_CONFIDENCE_THRESHOLD = 0.5;

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
// eslint-disable-next-line sonarjs/no-invariant-returns
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();
  console.log(`[qanary-component-relation-detection] started at ${startedAtIso}`);
  console.log("[qanary-component-relation-detection] incoming message:", message);

  const question = await getQuestion(message);
  if (!question) {
    console.warn("[qanary-component-relation-detection] no question found in message");
    return message;
  }
  console.log("[qanary-component-relation-detection] question:", question);

  const relationResult = await classifyRelationType(question);

  if (!relationResult) {
    console.warn(`[qanary-component-relation-detection] could not classify relation for: "${question}"`);
    return message;
  }

  const rawRelationType = relationResult.relationType;
  const normalisedRelationType = typeof rawRelationType === "string" ? rawRelationType.trim().toUpperCase() : "";

  if (!isValidRelationType(normalisedRelationType)) {
    console.warn(
      `[relation-detection] invalid relation type "${rawRelationType}" for question "${question}". Skipping annotation.`
    );
    return message;
  }

  console.log(`[relation-detection] detected relation for question "${question}":`, relationResult);

  await createRelationAnnotation({
    message,
    relationType: normalisedRelationType,
    confidence: relationResult.confidence,
    componentUri: "urn:leipzigtreechat:component:relation-detection",
    annotationType: `${QANARY_PREFIX}AnnotationOfRelation`,
  });

  // --- Clarification: low confidence ---------------------------------------
  if (relationResult.confidence < CLARIFICATION_CONFIDENCE_THRESHOLD) {
    await writeClarificationIfNeeded(
      message,
      question,
      `Die Relation wurde als "${normalisedRelationType}" klassifiziert, jedoch mit niedriger Konfidenz (${relationResult.confidence.toFixed(2)}).`
    );
  }

  console.log("[qanary-component-relation-detection] relation annotation created");
  console.log(`[qanary-component-relation-detection] ended in ${Date.now() - startedAt}ms`);
  return message;
};

/**
 * Generates a clarification question via the LLM and writes it as an
 * `AnnotationOfClarification` into the knowledge graph.
 */
const writeClarificationIfNeeded = async (
  message: IQanaryMessage,
  question: string,
  ambiguityDescription: string
): Promise<void> => {
  try {
    const clarificationText = await generateClarificationQuestion({
      question,
      componentName: "qanary-component-relation-detection",
      ambiguityDescription,
    });

    if (clarificationText) {
      await createClarificationAnnotation({
        message,
        componentName: "qanary-component-relation-detection",
        clarificationQuestion: clarificationText,
      });
      console.log("[qanary-component-relation-detection] clarification annotation written");
    }
  } catch (error) {
    console.error("[qanary-component-relation-detection] error generating/writing clarification:", error);
  }
};

const KNOWN_RELATION_TYPE_SET = new Set<string>(KNOWN_RELATION_TYPES);
const isValidRelationType = (relationType: string): relationType is KnownRelationType => {
  return KNOWN_RELATION_TYPE_SET.has(relationType);
};

interface ICreateRelationAnnotationOptions {
  message: IQanaryMessage;
  relationType: KnownRelationType;
  confidence: number;
  componentUri: string;
  annotationType: string;
}

const createRelationAnnotation = async ({
  message,
  relationType,
  confidence,
  componentUri,
  annotationType,
}: ICreateRelationAnnotationOptions): Promise<void> => {
  const outGraph = getOutGraph(message);
  const endpointUrl = getEndpoint(message);
  const questionUri = await getQuestionUri(message);
  if (!outGraph || !endpointUrl || !questionUri) {
    console.error("[relation-detection] Missing required data for relation annotation:", {
      outGraph,
      endpointUrl,
      questionUri,
    });
    return;
  }

  const normalisedAnnotationType =
    String(annotationType).startsWith("http") || String(annotationType).startsWith("urn:")
      ? `<${annotationType}>`
      : annotationType;

  const relationAnnotationQuery = `
PREFIX qa: <http://www.wdaqua.eu/qa#>
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT {
  GRAPH <${outGraph}> {
    ?annotation a ${normalisedAnnotationType} ;
      oa:hasTarget <${questionUri}> ;
      oa:hasBody """${relationType}"""^^xsd:string ;
      oa:score '${confidence}'^^xsd:double ;
      oa:annotatedBy <${componentUri}> ;
      oa:annotatedAt ?time .
  }
}
WHERE {
  BIND (IRI(CONCAT("urn:qanary:annotation:relation-", STRUUID())) AS ?annotation)
  BIND (NOW() AS ?time)
}`;

  console.log("[relation-detection] relation annotation query:\n", relationAnnotationQuery);

  try {
    await updateSparql(endpointUrl, relationAnnotationQuery);
  } catch (error) {
    console.error("Error creating relation annotation in Qanary triplestore");
    console.error(error);
  }
};
