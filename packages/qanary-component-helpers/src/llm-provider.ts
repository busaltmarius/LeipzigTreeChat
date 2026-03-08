import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

/**
 * Environment variables controlling the LLM backend for all Qanary components:
 *
 *   OPENROUTER_API_KEY  – API key for OpenRouter (required at call time)
 *   LLM_MODEL           – model slug understood by OpenRouter
 *                         (default: "deepseek/deepseek-v3.2")
 *
 * Swap provider or model at runtime without touching source code — just
 * change the env vars in your .env file or execution environment.
 *
 * Security note: the API key is read lazily (only when a model is requested)
 * and is never stored in a variable that outlives the factory call, mirroring
 * the spirit of Effect's `Redacted` pattern used in the chatbot package.
 * It is intentionally never logged or included in error messages.
 */

const DEFAULT_MODEL = "deepseek/deepseek-v3.2";

/**
 * Returns a configured `LanguageModel` instance ready for use with the
 * Vercel AI SDK (`generateText`, `generateObject`, …).
 *
 * Throws a descriptive error when `OPENROUTER_API_KEY` is absent so
 * components fail fast and clearly on misconfiguration rather than producing
 * cryptic downstream errors.
 *
 * @example
 * ```ts
 * import { getLlmModel } from "@leipzigtreechat/qanary-component-helpers";
 * import { generateObject } from "ai";
 *
 * const { object } = await generateObject({
 *   model: getLlmModel(),
 *   schema: MySchema,
 *   prompt: "...",
 * });
 * ```
 */
export const getLlmModel = (): LanguageModel => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[qanary-component-helpers] Missing required environment variable: OPENROUTER_API_KEY. " +
        "Set it in your component's .env file or execution environment."
    );
  }

  const modelSlug = process.env.LLM_MODEL ?? DEFAULT_MODEL;

  // The key is consumed here and not retained — the returned LanguageModel
  // object holds no direct reference to the raw key string.
  const openrouter = createOpenRouter({ apiKey });
  return openrouter.chat(modelSlug);
};
