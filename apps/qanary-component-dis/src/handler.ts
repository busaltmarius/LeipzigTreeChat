import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import type { IQanaryMessage } from "@leipzigtreechat/qanary-component-helpers";
import { getQuestionUri } from "@leipzigtreechat/qanary-component-helpers";
import { disambiguate, fetchNerAnnotations, writeDisambiguationAnnotation } from "./implementation";
import type { DisambiguationResult, NerAnnotation } from "./types";

async function disambiguateNERResults(message: IQanaryMessage): Promise<void> {
  const questionUri = await getQuestionUri(message);

  if (!questionUri) {
    console.warn("No question URI found in message.");
    return;
  }

  console.log(`Starting disambiguation for question: ${questionUri}`);

  // Fetch all NER annotations for this question
  const annotations = await fetchNerAnnotations(message, questionUri);
  console.log(`Found ${annotations.length} NER annotation(s)`);

  if (annotations.length === 0) {
    console.log("No NER annotations to disambiguate.");
    return;
  }

  // Disambiguate each annotation
  const results = await Promise.all(
    annotations.map(async (annotation: NerAnnotation) => {
      try {
        const result = await disambiguate(annotation);
        return { annotation, result };
      } catch (error) {
        console.error(`Failed to disambiguate "${annotation.exactQuote}":`, error);
        return { annotation, result: null };
      }
    })
  );

  // Write successful disambiguations back to triplestore
  const writePromises = results
    .filter(({ result }) => result !== null)
    .map(({ annotation, result }) =>
      writeDisambiguationAnnotation(message, annotation, result as DisambiguationResult)
    );

  await Promise.all(writePromises);

  const succeeded = results.filter(({ result }) => result !== null).length;
  console.log(`Done: ${succeeded}/${annotations.length} entities disambiguated`);
}

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  console.log("Disambiguation component received message:", message);

  try {
    // Run the disambiguation pipeline
    await disambiguateNERResults(message);
    console.log("Disambiguation pipeline completed successfully");
  } catch (error) {
    console.error("Error in disambiguation pipeline:", error);
    // Don't throw - return the original message to keep the pipeline running
  }

  return message;
};
