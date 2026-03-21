import type { IQanaryMessage } from "./api.js";
import { getQuestionUri } from "./get-question-uri.js";
import { getEndpoint, getOutGraph } from "./message-operations.js";
import { updateSparql } from "./query-sparql.js";

/**
 * Options for creating a clarification annotation in the knowledge graph.
 */
export interface ICreateClarificationAnnotationOptions {
  /** The qanary message containing the endpoint and graph */
  message: IQanaryMessage;
  /** The component name that creates the annotation */
  componentName: string;
  /** The clarification question text to store */
  clarificationQuestion: string;
}

/**
 * Escapes a string for safe use inside a SPARQL triple-quoted literal (`"""…"""`).
 *
 * The only problematic sequence is three consecutive double-quotes which would
 * prematurely close the literal.  We also escape backslashes so that existing
 * escape sequences are preserved.
 */
export const escapeSparqlTripleQuoted = (text: string): string => {
  return text.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
};

/**
 * Writes an `AnnotationOfClarification` into the Qanary knowledge graph.
 *
 * The annotation is stored as:
 * ```sparql
 *   ?annotation a <urn:qanary#AnnotationOfClarification> ;
 *     oa:hasBody "the question text" .
 * ```
 *
 * This is the format expected by the chatbot's
 * `TriplestoreService.queryClarifications()`.
 */
export const createClarificationAnnotation = async ({
  message,
  componentName,
  clarificationQuestion,
}: ICreateClarificationAnnotationOptions): Promise<void> => {
  const outGraph: string = getOutGraph(message) ?? "";
  const endpointUrl: string = getEndpoint(message) ?? "";
  const questionUri: string = (await getQuestionUri(message)) ?? "";

  const escapedQuestion = escapeSparqlTripleQuoted(clarificationQuestion);

  const query = `
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT {
  GRAPH <${outGraph}> {
    ?annotation a <urn:qanary#AnnotationOfClarification> ;
      oa:hasBody """${escapedQuestion}""" ;
      oa:hasTarget <${questionUri}> ;
      oa:annotatedBy <urn:${componentName}> ;
      oa:annotatedAt ?time .
  }
}
WHERE {
  BIND (IRI(CONCAT("urn:qanary:annotation:clarification-", STRUUID())) AS ?annotation)
  BIND (NOW() AS ?time)
}`;

  console.log(`[${componentName}] writing clarification annotation to triplestore`);
  console.log(`[${componentName}] clarification question: "${clarificationQuestion}"`);

  try {
    await updateSparql(endpointUrl, query);
  } catch (error) {
    console.error(`[${componentName}] Error writing clarification annotation to triplestore`);
    console.error(error);
  }
};
