import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import { createAnnotationInKnowledgeGraph } from "@leipzigtreechat/qanary-component-helpers";
import { getQuestion, type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";
import { detectAndRecogniseEntities } from "./nerd-classifier.ts";

/**
 * An event handler for incoming messages of the Qanary pipeline.
 * Exported only for testing purposes.
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

  const nerdResult = await detectAndRecogniseEntities(question);
  if (!nerdResult) {
    console.warn(`[nerd-simple] Could not detect entities for: "${question}"`);
    return message;
  }

  const { entities } = nerdResult;
  console.log(`[nerd-simple] Found ${entities.length} entity/entities for "${question}":`, entities);

  if (entities.length === 0) {
    console.log("[nerd-simple] No entities to annotate.");
    return message;
  }

  const componentName = "qanary-component-nerd-simple";

  for (const entity of entities) {
    await createAnnotationInKnowledgeGraph({
      message,
      componentName,
      annotation: {
        value: JSON.stringify({
          entity: entity.entity,
          type: entity.type,
        }),
        range: { start: entity.start, end: entity.end },
        confidence: entity.confidence,
      },
      annotationType: `${QANARY_PREFIX}AnnotationOfNerd`,
    });
  }

  console.log("Done");

  return message;
};
