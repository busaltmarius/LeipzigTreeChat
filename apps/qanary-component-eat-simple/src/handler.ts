import { URL } from "node:url";
import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  createAnnotationInKnowledgeGraph,
  createClarificationAnnotation,
  generateClarificationQuestion,
} from "@leipzigtreechat/qanary-component-helpers";
import { getQuestion, type IQanaryMessage, QANARY_EAT_PREFIX, QANARY_PREFIX } from "@leipzigtreechat/shared";
import { classifyExpectedAnswerType, EAT_TYPES, type EatType, eatTypeToUrl } from "./eat-classifier.ts";

const COMPONENT_NAME = "qanary-component-eat-simple";

/**
 * Confidence threshold below which a clarification question is generated
 * even though the classification result is still written to the graph.
 */
const CLARIFICATION_CONFIDENCE_THRESHOLD = 0.5;

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();
  console.log(`[${COMPONENT_NAME}] started at ${startedAtIso}`);
  console.log(`[${COMPONENT_NAME}] incoming message:`, message);

  const question = await getQuestion(message);
  if (!question) {
    console.warn(`[${COMPONENT_NAME}] no question found in message`);
    return message;
  }
  console.log(`[${COMPONENT_NAME}] question:`, question);

  const eatResult = await classifyExpectedAnswerType(question);

  // ── No result at all → log and return early ─────────────────────────────
  if (!eatResult) {
    console.warn(`[${COMPONENT_NAME}] could not determine expected answer type for: "${question}"`);
    return message;
  }

  const expectedEntityTypeUrl = eatTypeToUrl(eatResult.expectedAnswerType as EatType);
  console.log(
    `[${COMPONENT_NAME}] expected entity type for question "${question}":`,
    expectedEntityTypeUrl.toString(),
    `(confidence: ${eatResult.confidence})`
  );

  // ── Low confidence → clarify (but still write the annotation) ───────────
  if (eatResult.confidence < CLARIFICATION_CONFIDENCE_THRESHOLD) {
    console.warn(
      `[${COMPONENT_NAME}] low confidence (${eatResult.confidence}) for EAT "${eatResult.expectedAnswerType}" on question "${question}"`
    );

    await writeClarification(message, question, {
      reason: "low_confidence",
      detail:
        `Das System hat den erwarteten Antworttyp als "${eatResult.expectedAnswerType}" klassifiziert, ` +
        `jedoch mit niedriger Konfidenz (${eatResult.confidence}). ` +
        `Unterstützte Typen sind: ${EAT_TYPES.join(", ")}. ` +
        `Bitte frage den Nutzer, welche Art von Antwort er erwartet.`,
    });
  }

  await createAnnotationInKnowledgeGraph({
    message,
    componentName: COMPONENT_NAME,
    annotation: {
      value: expectedEntityTypeUrl.toString(),
      range: { start: 0, end: question.length },
      confidence: eatResult.confidence,
    },
    annotationType: `${QANARY_PREFIX}AnnotationOfExpectedAnswerType`,
  });

  console.log(`[${COMPONENT_NAME}] annotation created`);
  console.log(`[${COMPONENT_NAME}] ended in ${Date.now() - startedAt}ms`);
  return message;
};

/**
 * Generates an LLM-based clarification question and writes it as an
 * `AnnotationOfClarification` into the Qanary knowledge graph.
 */
async function writeClarification(
  message: IQanaryMessage,
  question: string,
  ambiguity: { reason: string; detail: string }
): Promise<void> {
  try {
    const clarificationText = await generateClarificationQuestion({
      question,
      componentName: COMPONENT_NAME,
      ambiguityDescription: ambiguity.detail,
    });

    if (clarificationText) {
      await createClarificationAnnotation({
        message,
        componentName: COMPONENT_NAME,
        clarificationQuestion: clarificationText,
      });
    }
  } catch (error) {
    console.error(`[${COMPONENT_NAME}] error generating/writing clarification:`, error);
  }
}

/**
 * Returns the EAT URL for a given question using the LLM classifier.
 * Exported for testing purposes.
 */
export const getExpectedEntityType = async (question: string): Promise<URL | null> => {
  const result = await classifyExpectedAnswerType(question);
  if (!result) return null;
  return eatTypeToUrl(result.expectedAnswerType as EatType);
};
