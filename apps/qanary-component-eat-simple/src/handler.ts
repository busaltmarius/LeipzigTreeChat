import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import { createAnnotationInKnowledgeGraph } from "@leipzigtreechat/qanary-component-helpers";
import { getQuestion, type IQanaryMessage, QANARY_EAT_PREFIX, QANARY_PREFIX } from "@leipzigtreechat/shared";
import { URL } from "url";

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
// eslint-disable-next-line sonarjs/no-invariant-returns
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  console.log(message);

  // Step 1: get question from message
  const question = await getQuestion(message);
  if (!question) {
    console.warn("No question found in message.");
    return message;
  }
  console.log("Question:", question);

  // Step 2: compute EAT for question
  const expectedEntityTypeMatch = await getExpectedEntityTypeMatch(question);
  const expectedEntityType = expectedEntityTypeMatch?.expectedEntityType ?? null;
  console.log("Expected entity type for question '" + question + "':", expectedEntityType);

  // Step 3: store expected entity type in Qanary triplestore
  const componentName = "qanary-component-eat-simple";
  await createAnnotationInKnowledgeGraph({
    message: message,
    componentName: componentName,
    annotation: {
      value: expectedEntityType?.toString() ?? "",
      range: { start: 0, end: expectedEntityTypeMatch?.prefix.length ?? 0 },
      confidence: 1,
    },
    annotationType: QANARY_PREFIX + "AnnotationOfExpectedAnswerType",
  });

  return message;
};

export const getExpectedEntityType = async (question: string) => {
  const result = await getExpectedEntityTypeMatch(question);
  return result?.expectedEntityType ?? null;
};

const getExpectedEntityTypeMatch = async (question: string) => {
  const lowerQuestion = question.toLowerCase();
  const rules: Array<[string, URL]> = [
    ["where", new URL(QANARY_EAT_PREFIX + "location")],
    ["who", new URL(QANARY_EAT_PREFIX + "person")],
    ["when", new URL(QANARY_EAT_PREFIX + "datetime")],
    ["what time", new URL(QANARY_EAT_PREFIX + "datetime")],
    ["what date", new URL(QANARY_EAT_PREFIX + "datetime")],
    ["how many", new URL(QANARY_EAT_PREFIX + "number")],
    ["how much", new URL(QANARY_EAT_PREFIX + "number")],
  ];

  for (const [prefix, expectedEntityType] of rules) {
    if (lowerQuestion.startsWith(prefix)) {
      return { prefix, expectedEntityType };
    }
  }

  console.warn("No expected entity type found for question '" + question + "'");
  return null;
};
