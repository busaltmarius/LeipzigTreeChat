import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import type { IQanaryMessage } from "@leipzigtreechat/qanary-component-helpers";
import {
  createClarificationAnnotation,
  generateClarificationQuestion,
  getQuestion,
  getQuestionUri,
} from "@leipzigtreechat/qanary-component-helpers";
import { disambiguate, fetchNerAnnotations, writeDisambiguationAnnotation } from "./implementation";
import type { DisambiguationOutcome, DisambiguationResult, NerAnnotation } from "./types";

async function disambiguateNERResults(message: IQanaryMessage): Promise<void> {
  const questionUri = await getQuestionUri(message);

  if (!questionUri) {
    console.warn("No question URI found in message.");
    return;
  }

  console.log(`Starting disambiguation for question: ${questionUri}`);

  const annotations = await fetchNerAnnotations(message, questionUri);
  console.log(`Found ${annotations.length} NER annotation(s)`);

  if (annotations.length === 0) {
    console.log("No NER annotations to disambiguate.");
    return;
  }

  const outcomes = await Promise.all(
    annotations.map(async (annotation: NerAnnotation) => {
      try {
        const outcome = await disambiguate(annotation);
        return { annotation, outcome };
      } catch (error) {
        console.error(`Failed to disambiguate "${annotation.exactQuote}":`, error);
        return { annotation, outcome: { result: null, candidates: [] } as DisambiguationOutcome };
      }
    })
  );

  // Write successful disambiguations back to triplestore
  const writePromises = outcomes
    .filter(({ outcome }) => outcome.result !== null)
    .map(({ annotation, outcome }) =>
      writeDisambiguationAnnotation(message, annotation, outcome.result as DisambiguationResult)
    );

  await Promise.all(writePromises);

  const succeeded = outcomes.filter(({ outcome }) => outcome.result !== null).length;
  console.log(`Done: ${succeeded}/${annotations.length} entities disambiguated`);

  // Generate clarification questions for ambiguous disambiguations (multiple candidates)
  const ambiguousResults = outcomes.filter(({ outcome }) => outcome.candidates.length > 1);
  if (ambiguousResults.length > 0) {
    try {
      const question = await getQuestion(message);
      if (question) {
        const ambiguousEntities = ambiguousResults
          .map(({ annotation, outcome }) => {
            const candidateLabels = outcome.candidates.map((c) => `"${c.label}"`).join(", ");
            return `"${annotation.exactQuote}" (Typ: ${annotation.entityType}, mögliche Treffer: ${candidateLabels})`;
          })
          .join("; ");

        const clarificationText = await generateClarificationQuestion({
          question,
          componentName: "qanary-component-dis",
          ambiguityDescription:
            `Für folgende Entitäten wurden mehrere passende Einträge in der Wissensbasis gefunden: ${ambiguousEntities}. ` +
            `Bitte frage den Nutzer, welchen konkreten Eintrag er meint.`,
        });

        if (clarificationText) {
          await createClarificationAnnotation({
            message,
            componentName: "qanary-component-dis",
            clarificationQuestion: clarificationText,
          });
        }
      }
    } catch (error) {
      console.error("[qanary-component-dis] error generating clarification:", error);
    }
  }
}

export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();
  console.log(`[qanary-component-dis] started at ${startedAtIso}`);
  console.log("[qanary-component-dis] incoming message:", message);

  try {
    await disambiguateNERResults(message);
    console.log("[qanary-component-dis] disambiguation pipeline completed successfully");
    console.log(`[qanary-component-dis] ended in ${Date.now() - startedAt}ms`);
  } catch (error) {
    console.error("[qanary-component-dis] error in disambiguation pipeline:", error);
  }

  return message;
};
