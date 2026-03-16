import type { LanguageModel } from "ai";
import { generateObject } from "ai";

/**
 * Extracts the first valid JSON object from text that may be wrapped in
 * markdown code fences, preceded by prose, or followed by explanations.
 *
 * Extraction strategy (in order):
 *  1. Content inside a markdown code fence  (```json … ``` or ``` … ```)
 *  2. First well-formed JSON object `{…}` found anywhere in the text
 *
 * @returns The extracted JSON string (trimmed), or `null` if nothing
 *          parseable was found.
 *
 * @example
 * extractJsonFromText('Here:\n```json\n{"a":1}\n```\nDone.')  // '{"a":1}'
 * extractJsonFromText('{"b":2}')                              // '{"b":2}'
 * extractJsonFromText('No JSON here.')                        // null
 */
export function extractJsonFromText(text: string): string | null {
  // ── 1. Markdown code fence ──────────────────────────────────────────────
  // Matches ```json\n…\n``` or ```\n…\n``` (non-greedy, so we get the first
  // fence block if there are multiple).
  const fenceMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n\s*```/);
  if (fenceMatch?.[1]) {
    const candidate = fenceMatch[1].trim();
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Not valid JSON in the fence – fall through to raw search.
    }
  }

  // ── 2. Raw JSON object anywhere in the text ─────────────────────────────
  // We walk character-by-character to find the matching closing brace so that
  // nested objects are handled correctly.
  const braceIdx = text.indexOf("{");
  if (braceIdx !== -1) {
    const slice = text.slice(braceIdx);
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let i = 0; i < slice.length; i++) {
      const ch = slice[i];

      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\" && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }

    if (end !== -1) {
      const candidate = slice.slice(0, end + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // Brace-matched content is not valid JSON.
      }
    }
  }

  return null;
}

/**
 * Retrieves the raw LLM response text stored on AI SDK error objects.
 *
 * Both `NoObjectGeneratedError` and `JSONParseError` (from `@ai-sdk/provider`)
 * expose the original model response via a `text` property on the thrown
 * error instance.
 */
function getRawTextFromError(error: unknown): string | undefined {
  if (error !== null && typeof error === "object" && "text" in error) {
    const text = (error as Record<string, unknown>).text;
    if (typeof text === "string" && text.length > 0) {
      return text;
    }
  }
  return undefined;
}

/**
 * Minimal schema interface required by {@link generateObjectWithRetry}.
 *
 * Structurally compatible with both Zod v3 and Zod v4 schemas – no direct
 * Zod import is needed in this package.
 */
type ParseableSchema<T> = {
  safeParse(data: unknown): { success: boolean; data?: T };
};

/**
 * Drop-in replacement for the AI SDK's `generateObject` that adds two
 * recovery strategies for models that do not return clean JSON:
 *
 * **Strategy 1 – Markdown extraction (no extra LLM call):**
 * Some instruction-tuned models (e.g. `anthropic/claude-3.5-haiku` via
 * OpenRouter) wrap their JSON response in a markdown code fence even when
 * asked not to.  The AI SDK then throws a parse error that carries the full
 * raw response in its `text` property.  We extract the JSON from that text
 * and validate it against the caller's schema before spending another token.
 *
 * **Strategy 2 – Retry with explicit JSON reminder:**
 * If extraction fails (or the error had no raw text), we retry the full LLM
 * call.  On every retry we append a reminder to the prompt asking for plain
 * JSON without markdown, giving the model a chance to self-correct.
 *
 * @param options    Same options accepted by the AI SDK's `generateObject`
 *                   (`model`, `schema`, `system`, `prompt`).
 * @param maxRetries Maximum number of LLM calls in total.  Defaults to `3`.
 * @returns          `{ object: T }` – same shape as `generateObject`.
 * @throws           Re-throws the last error if all attempts are exhausted.
 */
export async function generateObjectWithRetry<T>(
  options: {
    model: LanguageModel;
    /**
     * A Zod (v3 or v4) schema – or any object with a compatible `safeParse`
     * method – that describes the expected response shape.
     */
    schema: ParseableSchema<T>;
    system?: string;
    prompt: string;
  },
  maxRetries = 3
): Promise<{ object: T }> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // On retries we append a reminder so the model understands its previous
    // response was rejected due to formatting.
    const prompt =
      attempt === 0
        ? options.prompt
        : `${options.prompt}\n\nIMPORTANT: Respond with ONLY valid JSON — no markdown code fences, no prose, no explanations.`;

    try {
      // Cast: ParseableSchema<T> is structurally compatible with whatever
      // ZodType the AI SDK expects; Zod schemas satisfy both interfaces.
      const result = await generateObject({
        model: options.model,
        schema: options.schema as any,
        system: options.system,
        prompt,
      });

      return result as { object: T };
    } catch (error) {
      lastError = error;

      // ── Markdown-extraction recovery ──────────────────────────────────
      // The AI SDK stores the raw model response text on parse-error objects.
      // We try to salvage a valid object from it before spending another call.
      const rawText = getRawTextFromError(error);
      if (rawText) {
        const extracted = extractJsonFromText(rawText);
        if (extracted) {
          try {
            const parsed: unknown = JSON.parse(extracted);
            const validation = options.schema.safeParse(parsed);
            if (validation.success && validation.data !== undefined) {
              return { object: validation.data };
            }
          } catch {
            // Extraction produced text that is not JSON-parseable or does
            // not satisfy the schema.  Fall through to the next retry.
          }
        }
      }
      // Continue to next loop iteration → new LLM call with updated prompt.
    }
  }

  throw lastError;
}
