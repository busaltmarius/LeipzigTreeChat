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
  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();
  console.log(`[qanary-component-nerd-simple] started at ${startedAtIso}`);
  console.log("[qanary-component-nerd-simple] incoming message:", message);

  const question = await getQuestion(message);
  if (!question) {
    console.warn("[qanary-component-nerd-simple] no question found in message");
    return message;
  }
  console.log("[qanary-component-nerd-simple] question:", question);

  const nerdResult = await detectAndRecogniseEntities(question);
  if (!nerdResult) {
    console.warn(`[qanary-component-nerd-simple] could not detect entities for: "${question}"`);
    return message;
  }

  const { entities } = nerdResult;
  console.log(`[qanary-component-nerd-simple] found ${entities.length} entities for "${question}":`, entities);

  if (entities.length === 0) {
    console.log("[qanary-component-nerd-simple] no entities to annotate");
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
      annotationType: `${QANARY_PREFIX}AnnotationOfSpotInstance`,
    });
  }

  console.log(`[qanary-component-nerd-simple] created ${entities.length} spot annotations`);
  console.log(`[qanary-component-nerd-simple] ended in ${Date.now() - startedAt}ms`);
  return message;
};
