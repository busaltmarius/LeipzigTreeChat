import { generateObjectWithRetry, getLlmModel } from "@leipzigtreechat/qanary-component-helpers";
import { QANARY_EAT_PREFIX } from "@leipzigtreechat/shared";
import { z } from "zod";

/**
 * All supported Expected Answer Types.
 * Each maps to a URN in the Qanary EAT namespace.
 */
export const EAT_TYPES = [
  "object",
  "list",
  "number",
  "bool",
  "string",
  "datetime",
  "date",
  "time",
  "timestamp",
  "enumeration",
] as const;

export type EatType = (typeof EAT_TYPES)[number];

/**
 * Zod schema for the structured LLM response.
 * Using `generateObject` forces the model to return a validated enum value
 * instead of free-form text, eliminating fragile string parsing.
 */
const EatResponseSchema = z.object({
  expectedAnswerType: z
    .enum(EAT_TYPES as unknown as [string, ...string[]])
    .describe(
      "The expected answer type that best matches the question. " + "Choose exactly one of the allowed values."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Your confidence in the classification, between 0.0 (no confidence) and 1.0 (certain)."),
  reasoning: z.string().optional().describe("Short explanation for the chosen type (used for logging only)."),
});

export type EatResponse = z.infer<typeof EatResponseSchema>;

const SYSTEM_PROMPT = `You are a question-answering classification component in a knowledge-graph QA pipeline.
Your sole task is to determine the EXPECTED ANSWER TYPE for a given natural-language question.

Allowed types and when to use them:
- object     : The answer is a named entity, person, place, thing, or concept (e.g. "Who planted this tree?", "Where is X?").
- list       : The answer is an enumeration of multiple items of the same kind (e.g. "Which trees are in district Y?").
- enumeration: The answer is a short fixed-set category value (e.g. tree species names, status labels).
- number     : The answer is a numeric quantity (count, amount, measurement) without a specific date/time aspect.
- bool       : The answer is yes/no or true/false (e.g. "Is this tree protected?").
- string     : The answer is a short free-text label or name that does not fit other categories.
- date       : The answer is a calendar date without a time component (e.g. "When was it planted?" → "2015-04-12").
- time       : The answer is a time-of-day without a date component (e.g. "At what time does the park open?").
- datetime   : The answer involves both date and time, or a general temporal concept (e.g. "When was it last watered?").
- timestamp  : The answer is a precise machine-readable timestamp (ISO 8601 with timezone).

Rules:
1. Answer ONLY with one of the allowed type values — do NOT invent new types.
2. If the question asks for a count or quantity, prefer "number".
3. If the question asks for multiple items of the same kind, prefer "list".
4. If the question asks for a single named entity, person or location, prefer "object".
5. When in doubt between "date", "time", and "datetime", prefer "datetime".
6. Set confidence to reflect how unambiguous the classification is.`;

/**
 * Calls the LLM to classify the expected answer type for a question.
 *
 * @param question  The natural-language question to classify.
 * @param modelFactory  Optional override for the model factory (for testing).
 * @returns  The full structured EAT response, or null if classification fails.
 */
export const classifyExpectedAnswerType = async (
  question: string,
  modelFactory: () => ReturnType<typeof getLlmModel> = getLlmModel
): Promise<EatResponse | null> => {
  try {
    const model = modelFactory();

    const { object } = await generateObjectWithRetry({
      model,
      schema: EatResponseSchema,
      system: SYSTEM_PROMPT,
      prompt: `Classify the expected answer type for this question:\n\n"${question}"`,
    });

    if (object.reasoning) {
      console.log(`[eat-simple] LLM reasoning for "${question}": ${object.reasoning}`);
    }

    return object;
  } catch (error) {
    console.error(`[eat-simple] Failed to classify expected answer type for question "${question}":`, error);
    return null;
  }
};

/**
 * Maps an EatType string to its full Qanary EAT namespace URL.
 */
export const eatTypeToUrl = (eatType: EatType): URL => new URL(`${QANARY_EAT_PREFIX}${eatType}`);
