import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import { getEndpoint, getOutGraph, getQuestion, getQuestionUri, updateSparql } from "@leipzigtreechat/qanary-component-helpers";
import { type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";
import { classifyRelationType } from "./relation-classifier.ts";
import { KNOWN_RELATION_TYPES, type KnownRelationType } from "./relation-types.ts";

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
// eslint-disable-next-line sonarjs/no-invariant-returns
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  console.log(message);

  const question = await getQuestion(message);
  if (!question) {
    console.warn("No question found in message.");
    return message;
  }
  console.log("Question:", question);

  const relationResult = await classifyRelationType(question);
  if (!relationResult) {
    console.warn(`[relation-detection] Could not classify relation for: "${question}"`);
    return message;
  }

  const rawRelationType = relationResult.relationType;
  const normalisedRelationType = typeof rawRelationType === "string" ? rawRelationType.trim().toUpperCase() : "";
  if (!isValidRelationType(normalisedRelationType)) {
    console.warn(
      `[relation-detection] Invalid relation type "${rawRelationType}" for question "${question}". Skipping annotation.`
    );
    return message;
  }

  console.log(`[relation-detection] Relation for question "${question}":`, relationResult);

  await createRelationAnnotation({
    message,
    relationType: normalisedRelationType,
    confidence: relationResult.confidence,
    componentUri: "urn:leipzigtreechat:component:relation-detection",
    annotationType: `${QANARY_PREFIX}AnnotationOfRelation`,
  });

  console.log("Done");

  return message;
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

  try {
    await updateSparql(endpointUrl, relationAnnotationQuery);
  } catch (error) {
    console.error("Error creating relation annotation in Qanary triplestore");
    console.error(error);
  }
};
