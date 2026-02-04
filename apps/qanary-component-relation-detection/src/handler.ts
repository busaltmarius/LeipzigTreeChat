import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  createAnnotationInKnowledgeGraph,
  type IAnnotationInformation,
} from "@leipzigtreechat/qanary-component-helpers";
import { getQuestion, type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";

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

  const annotation: Array<IAnnotationInformation> = await getRelAnnotation(question);
  console.log(`Relation for question '${question}':`, annotation);

  await createAnnotationInKnowledgeGraph({
    message: message,
    componentName: "qanary-component-rel-simple",
    annotation,
    annotationType: `${QANARY_PREFIX}AnnotationOfRelation`,
  });

  return message;
};

enum RELATION_TYPE {
  AMOUNT_WATERED_DISTRICT = "AMOUNT_WATERED_DISTRICT",
  WATER_INTAKE_ADDRESS = "WATER_INTAKE_ADDRESS",
  WATER_TREE_AT_STREET = "WATER_TREE_AT_STREET",
  DESCRIBE_TREES_REGION = "DESCRIBE_TREES_REGION",
}

const getRelAnnotation = async (question: string): Promise<IAnnotationInformation> => {
  let relation = "";
  if (question == "Wie viel wurde im Stadtteil Connewitz gegossen?") {
    relation = RELATION_TYPE.AMOUNT_WATERED_DISTRICT;
  } else if (
    question == "Welche Wasserentnahmestellen gibt es in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig?"
  ) {
    relation = RELATION_TYPE.WATER_INTAKE_ADDRESS;
  } else if (
    question == "Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?"
  ) {
    relation = RELATION_TYPE.WATER_TREE_AT_STREET;
  } else if (question == "Was kannst du mir über die Bäume in Leipzig erklären?") {
    relation = RELATION_TYPE.DESCRIBE_TREES_REGION;
  }

  return {
    value: relation,
    range: { start: 0, end: 0 },
    confidence: 1,
  };
};
