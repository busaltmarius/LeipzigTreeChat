import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import { createAnnotationInKnowledgeGraph, getEndpoint, selectSparql } from "@leipzigtreechat/qanary-component-helpers";
import { type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
// eslint-disable-next-line sonarjs/no-invariant-returns
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  console.log(message);

  const get_relation_query = "";

  // Step 1: get relation annotation from qanary triplestore
  const relationResponse = await selectSparql({
    endpointUrl: getEndpoint(message),
    query: get_relation_query,
  });

  const relation = relationResponse;

  const template = await mapRelationToTemplate(relation);

  const get_answer_query = template;

  const componentName = "qanary-component-sparql-generation";
  await createAnnotationInKnowledgeGraph({
    message: message,
    componentName: componentName,
    annotation: {
      value: get_answer_query,
    },
    annotationType: `${QANARY_PREFIX}AnnotationOfSparqlQuery`,
  });

  const answerResponse = await selectSparql({
    endpointUrl: "",
    query: get_answer_query,
  });

  const answer = answerResponse;

  await createAnnotationInKnowledgeGraph({
    message: message,
    componentName: componentName,
    annotation: {
      value: answer,
    },
    annotationType: `${QANARY_PREFIX}AnnotationOfAnswer`,
  });

  return message;
};

export const mapRelationToTemplate = async (_relation: string) => {};
