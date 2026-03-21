import type { LanguageModel } from "ai";
import { getLlmModel } from "./llm-provider.js";

/**
 * Context describing the ambiguity that triggered a clarification request.
 */
export interface ClarificationContext {
  /** The original user question. */
  question: string;
  /** The component that encountered the ambiguity. */
  componentName: string;
  /** A description of what is ambiguous and why clarification is needed. */
  ambiguityDescription: string;
}

/**
 * Signature for a text-generation function compatible with the AI SDK's
 * `generateText`.  Accepting this as a parameter allows callers (and tests)
 * to inject their own implementation without having to mock the `ai` module.
 */
export type GenerateTextFn = (options: {
  model: LanguageModel;
  system: string;
  prompt: string;
}) => Promise<{ text: string }>;

const SYSTEM_PROMPT = `Du bist ein Klärungsassistent in einer Frage-Antwort-Pipeline über städtische Bäume in Leipzig, Deutschland.
Deine Aufgabe ist es, eine kurze, klare und freundliche Rückfrage an den Nutzer zu formulieren, wenn das System bei der Verarbeitung seiner Frage auf eine Mehrdeutigkeit stößt.

Regeln:
1. Gib NUR die Rückfrage aus — keine Einleitung, keine Erklärung, keine umgebenden Anführungszeichen.
2. Die Rückfrage MUSS auf Deutsch sein.
3. Halte dich kurz (maximal 1–2 Sätze).
4. Sei konkret, was geklärt werden muss.
5. Biete dem Nutzer wenn möglich konkrete Optionen zur Auswahl an.`;

/**
 * Uses an LLM to generate a human-readable clarification question based on
 * the provided ambiguity context.
 *
 * The generated text is intended to be stored as an
 * `AnnotationOfClarification` in the Qanary knowledge graph so that the
 * chatbot can present it to the user.
 *
 * @param context       Describes the original question and what is ambiguous.
 * @param modelFactory  Optional override for the LLM model factory (for testing / DI).
 * @param generateFn    Optional override for the text-generation function.
 *                      When omitted the function dynamically imports `generateText` from `ai`.
 * @returns The clarification question string, or `null` if generation fails.
 */
export const generateClarificationQuestion = async (
  context: ClarificationContext,
  modelFactory: () => LanguageModel = getLlmModel,
  generateFn?: GenerateTextFn
): Promise<string | null> => {
  const prompt = `Der Nutzer fragte: "${context.question}"

Die Komponente "${context.componentName}" ist auf folgende Mehrdeutigkeit gestoßen:
${context.ambiguityDescription}

Formuliere eine Rückfrage an den Nutzer:`;

  try {
    // Use the injected generator or fall back to the AI SDK's generateText.
    const generate: GenerateTextFn = generateFn ?? ((await import("ai")).generateText as GenerateTextFn);

    const model = modelFactory();
    const { text } = await generate({
      model,
      system: SYSTEM_PROMPT,
      prompt,
    });

    const trimmed = text.trim();
    if (!trimmed) {
      console.warn(`[${context.componentName}] LLM returned empty clarification question`);
      return null;
    }

    console.log(`[${context.componentName}] generated clarification: "${trimmed}"`);
    return trimmed;
  } catch (error) {
    console.error(`[${context.componentName}] Failed to generate clarification question:`, error);
    return null;
  }
};
