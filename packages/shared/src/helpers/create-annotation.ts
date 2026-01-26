import type { IQanaryMessage } from "../interfaces/qanary-interfaces.js";

import { getQuestionUri } from "./get-question-uri.js";
import { getEndpoint, getOutGraph } from "./message-operations.js";
import { updateSparql } from "./query-sparql.js";

/**
 * The interface for the information needed for a qanary annotation
 * @property value the value of the found annotation
 * @property range the range of the found annotation
 */
export interface IAnnotationInformation {
  /** the value of the found annotation */
  value: string;
  /** the range of the found annotation */
  range: IAnnotationInformationRange;
  /** the confidence of the found annotation */
  confidence: number;
}

/**
 * The range info range for a qanary annotation
 * @property start the start of the found annotation
 * @property end the end of the found annotation
 */
export interface IAnnotationInformationRange {
  /** the start of the found annotation */
  start: number;
  /** the end of the found annotation */
  end: number;
}

/**
 * The options to create an annotation in the knowledge graph
 */
export interface ICreateAnnotationInKnowledgeGraphOptions {
  /** the qanary message containing the endpoint and graph */
  message: IQanaryMessage;
  /** the component name that creates the annotation */
  componentName: string;
  /** the actual annotation to be created */
  annotation: IAnnotationInformation;
  /** the type of the annotation, prefixed with "qa:", defaults to "qa:AnnotationAnswer" */
  annotationType?: string;
}

/**
 * Creates an annotation in the knowledge graph given in the message
 * @param message the qanary message containing the endpoint and graph
 * @param componentName the component name that creates the annotation
 * @param annotation the actual annotation to be created
 * @param annotationType the type of the annotation, prefixed with "qa:", defaults to "qa:AnnotationAnswer"
 */
export const createAnnotationInKnowledgeGraph = async ({
  message,
  componentName,
  annotation,
  annotationType = "qa:AnnotationAnswer",
}: ICreateAnnotationInKnowledgeGraphOptions): Promise<void> => {
  const outGraph: string = getOutGraph(message) ?? "";
  const endpointUrl: string = getEndpoint(message) ?? "";
  const questionUri: string = (await getQuestionUri(message)) ?? "";

  const annotationQuery = `
PREFIX qa: <http://www.wdaqua.eu/qa#>
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT {
    GRAPH <${outGraph}> {
        ?annotation a ${annotationType} .
        ?annotation oa:hasTarget [
            a oa:SpecificResource ;
            oa:hasSource <${questionUri}> ;
            oa:hasSelector [
                a oa:TextPositionSelector ;
                oa:start '${annotation.range.start}'^^xsd:nonNegativeInteger ;
                oa:end '${annotation.range.end}'^^xsd:nonNegativeInteger
            ]
        ] ;
            oa:hasBody '${annotation.value}' ;
            oa:score '${annotation.confidence}'^^xsd:double ;
            oa:annotatedBy <urn:qanary:${componentName}> ;
            oa:annotatedAt ?time .
    }
}
WHERE {
    BIND (IRI(str(RAND())) AS ?annotation)
    BIND (now() as ?time)
}`;

  try {
    await updateSparql(endpointUrl, annotationQuery);
  } catch (error) {
    console.error(error);
  }
};
