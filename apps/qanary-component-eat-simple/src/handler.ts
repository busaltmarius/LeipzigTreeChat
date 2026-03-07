import { URL } from "node:url";
import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import { createAnnotationInKnowledgeGraph } from "@leipzigtreechat/qanary-component-helpers";
import { getQuestion, type IQanaryMessage, QANARY_EAT_PREFIX, QANARY_PREFIX } from "@leipzigtreechat/shared";
import { classifyExpectedAnswerType, type EatType, eatTypeToUrl } from "./eat-classifier.ts";

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  console.log(message);

  const question = await getQuestion(message);
  if (!question) {
    console.warn("No question found in message.");
    return message;
  }
  console.log("Question:", question);

  const eatResult = await classifyExpectedAnswerType(question);
  if (!eatResult) {
    console.warn(`[eat-simple] Could not determine expected answer type for: "${question}"`);
    return message;
  }

  const expectedEntityTypeUrl = eatTypeToUrl(eatResult.expectedAnswerType as EatType);
  console.log(
    `Expected entity type for question '${question}':`,
    expectedEntityTypeUrl.toString(),
    `(confidence: ${eatResult.confidence})`
  );

  const componentName = "qanary-component-eat-simple";
  await createAnnotationInKnowledgeGraph({
    message: message,
    componentName: componentName,
    annotation: {
      value: expectedEntityTypeUrl.toString(),
      range: { start: 0, end: question.length },
      confidence: eatResult.confidence,
    },
    annotationType: `${QANARY_PREFIX}AnnotationOfExpectedAnswerType`,
  });

  console.log("Done");

  return message;
};

/**
 * Returns the EAT URL for a given question using the LLM classifier.
 * Exported for testing purposes.
 */
export const getExpectedEntityType = async (question: string): Promise<URL | null> => {
  const result = await classifyExpectedAnswerType(question);
  if (!result) return null;
  return eatTypeToUrl(result.expectedAnswerType as EatType);
};
