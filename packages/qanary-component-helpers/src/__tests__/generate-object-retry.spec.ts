import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mock the "ai" module BEFORE importing the module under test.
// ---------------------------------------------------------------------------

/**
 * Replaceable implementation so individual tests can control the behaviour
 * of `generateObject` without recreating the mock every time.
 * Receives the full options object so tests can inspect prompt, schema, etc.
 */
let mockGenerateObjectImpl: (opts: unknown) => Promise<{ object: unknown }> = async () => ({
  object: {},
});

const mockGenerateObject = mock((opts: unknown) => mockGenerateObjectImpl(opts));

mock.module("ai", () => ({
  generateObject: mockGenerateObject,
}));

// Import AFTER mocks are registered so the module uses the mocked "ai".
const { extractJsonFromText, generateObjectWithRetry } = await import("../generate-object-retry.js");

// ---------------------------------------------------------------------------
// Schema helpers (no Zod dependency in this package)
// ---------------------------------------------------------------------------

type SafeParseResult<T> = { success: true; data: T } | { success: false; data?: never };

/**
 * Creates a minimal schema object compatible with {@link generateObjectWithRetry}'s
 * `ParseableSchema<T>` structural type.
 */
function makeSchema<T>(parse: (data: unknown) => T): { safeParse(data: unknown): SafeParseResult<T> } {
  return {
    safeParse(data: unknown): SafeParseResult<T> {
      try {
        return { success: true, data: parse(data) };
      } catch {
        return { success: false };
      }
    },
  };
}

/** Accepts any plain (non-null, non-array) object. */
const anyObjectSchema = makeSchema((data: unknown) => {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("expected a plain object");
  }
  return data as Record<string, unknown>;
});

/**
 * Validates the nerd-classifier response shape:
 * `{ entities: Array<{ entity, type, start, end, confidence }> }`
 */
const nerdSchema = makeSchema((data: unknown) => {
  if (typeof data !== "object" || data === null) throw new Error("not an object");
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.entities)) throw new Error("missing entities array");
  return { entities: obj.entities } as {
    entities: Array<{
      entity: string;
      type: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  };
});

/**
 * Validates the eat-classifier response shape:
 * `{ expectedAnswerType: string, confidence: number, reasoning?: string }`
 */
const eatSchema = makeSchema((data: unknown) => {
  if (typeof data !== "object" || data === null) throw new Error("not an object");
  const obj = data as Record<string, unknown>;
  if (typeof obj.expectedAnswerType !== "string") throw new Error("missing expectedAnswerType");
  if (typeof obj.confidence !== "number") throw new Error("missing confidence");
  return obj as { expectedAnswerType: string; confidence: number; reasoning?: string };
});

/** A minimal fake LanguageModel — only identity matters. */
const fakeModel = { modelId: "fake-model" } as Parameters<typeof generateObjectWithRetry>[0]["model"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const setSuccess = (object: unknown): void => {
  mockGenerateObjectImpl = async () => ({ object });
};

const setError = (error: Error): void => {
  mockGenerateObjectImpl = async () => {
    throw error;
  };
};

/**
 * Creates an error that mimics the AI SDK's `NoObjectGeneratedError` or
 * `JSONParseError` — both of which expose the raw model response as a `text`
 * property on the thrown instance.
 */
const makeParseError = (rawText: string, name = "AI_NoObjectGeneratedError"): Error => {
  const err = new Error(`No object generated: could not parse the response.`);
  err.name = name;
  Object.assign(err, { text: rawText });
  return err;
};

// ---------------------------------------------------------------------------
// extractJsonFromText
// ---------------------------------------------------------------------------

describe("extractJsonFromText", () => {
  // ── Markdown code fence (```json) ─────────────────────────────────────────

  test("extracts JSON from a ```json code fence", () => {
    const input = 'Preamble:\n```json\n{"key":"value"}\n```\nTrailing text.';
    expect(extractJsonFromText(input)).toBe('{"key":"value"}');
  });

  test("extracts JSON from a plain ``` code fence (no language tag)", () => {
    const input = 'Result:\n```\n{"a":1,"b":2}\n```\nEnd.';
    expect(extractJsonFromText(input)).toBe('{"a":1,"b":2}');
  });

  test("handles extra whitespace after the language tag on the opening line", () => {
    const input = '```json  \n{"x":true}\n```';
    const result = extractJsonFromText(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ x: true });
  });

  test("trims surrounding whitespace inside the code fence", () => {
    const input = '```json\n  \n{"n":7}\n  \n```';
    const result = extractJsonFromText(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual({ n: 7 });
  });

  test("extracts multi-line pretty-printed JSON from a code fence", () => {
    const obj = { entities: [{ entity: "Leipzig", type: "CITY" }] };
    const input = `\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``;
    const result = extractJsonFromText(input);
    expect(result).not.toBeNull();
    expect(JSON.parse(result!)).toEqual(obj);
  });

  // ── Raw JSON (no code fences) ─────────────────────────────────────────────

  test("extracts a bare JSON object with no surrounding text", () => {
    expect(extractJsonFromText('{"entities":[]}')).toBe('{"entities":[]}');
  });

  test("extracts JSON that is preceded by prose", () => {
    const input = 'The classification is: {"expectedAnswerType":"number","confidence":0.9}';
    const result = extractJsonFromText(input);
    expect(JSON.parse(result!)).toEqual({ expectedAnswerType: "number", confidence: 0.9 });
  });

  test("extracts JSON that is followed by prose", () => {
    const input = '{"val":42} — that is the answer.';
    const result = extractJsonFromText(input);
    expect(JSON.parse(result!)).toEqual({ val: 42 });
  });

  // ── Nested structures ─────────────────────────────────────────────────────

  test("handles deeply nested JSON objects inside a code fence", () => {
    const obj = { a: { b: { c: [1, 2, 3] } } };
    const input = `\`\`\`json\n${JSON.stringify(obj)}\n\`\`\``;
    const result = extractJsonFromText(input);
    expect(JSON.parse(result!)).toEqual(obj);
  });

  test("handles JSON strings containing curly braces", () => {
    const obj = { code: "if(x){return y}" };
    const result = extractJsonFromText(JSON.stringify(obj));
    expect(JSON.parse(result!)).toEqual(obj);
  });

  test("handles JSON strings containing escaped double-quotes", () => {
    const raw = '{"msg":"say \\"hello\\""}';
    expect(extractJsonFromText(raw)).toBe(raw);
  });

  // ── No valid JSON ─────────────────────────────────────────────────────────

  test("returns null for plain text with no JSON", () => {
    expect(extractJsonFromText("This is just plain text.")).toBeNull();
  });

  test("returns null for an empty string", () => {
    expect(extractJsonFromText("")).toBeNull();
  });

  test("returns null when a code fence contains non-JSON text", () => {
    const input = "```json\nthis is not JSON at all\n```";
    expect(extractJsonFromText(input)).toBeNull();
  });

  test("returns null for unclosed braces", () => {
    expect(extractJsonFromText("{unclosed")).toBeNull();
  });

  // ── Real error-log scenarios ──────────────────────────────────────────────

  test("extracts NERD JSON from the exact claude-3.5-haiku nerd-simple response in the error log", () => {
    // This is the exact text property from the AI_NoObjectGeneratedError in the
    // error log, reconstructed from the logged output.
    const claudeNerdResponse =
      "I'll help you detect and recognize the named entities in this question. Here's the analysis:\n\n" +
      "```json\n" +
      "{\n" +
      '  "entities": [\n' +
      "    {\n" +
      '      "entity": "Connewitz",\n' +
      '      "type": "DISTRICT",\n' +
      '      "start": 24,\n' +
      '      "end": 33,\n' +
      '      "confidence": 0.95\n' +
      "    }\n" +
      "  ]\n" +
      "}\n" +
      "```\n\n" +
      "Explanation:\n" +
      '- "Connewitz" is recognized as a DISTRICT, which is one of the predefined types for city districts or Stadtteile in Leipzig.\n' +
      "- The entity starts at character offset 24 and ends at character offset 33.\n" +
      "- Confidence is set high (0.95) as this is a clear, unambiguous district name.\n" +
      "- No other named entities were detected in this question.\n\n" +
      'The question translates to: "How much was watered in the Connewitz district?"';

    const result = extractJsonFromText(claudeNerdResponse);
    expect(result).not.toBeNull();

    const parsed = JSON.parse(result!);
    expect(parsed.entities).toHaveLength(1);
    expect(parsed.entities[0].entity).toBe("Connewitz");
    expect(parsed.entities[0].type).toBe("DISTRICT");
    expect(typeof parsed.entities[0].start).toBe("number");
    expect(typeof parsed.entities[0].confidence).toBe("number");
  });

  test("extracts EAT JSON from a typical claude markdown response", () => {
    const claudeEatResponse =
      "I'll classify the expected answer type for this question.\n\n" +
      "```json\n" +
      "{\n" +
      '  "expectedAnswerType": "number",\n' +
      '  "confidence": 0.95,\n' +
      '  "reasoning": "The question asks for a quantity (Wie viel = how much)."\n' +
      "}\n" +
      "```\n\n" +
      'The answer is expected to be a "number" because "Wie viel" asks for a numeric quantity.';

    const result = extractJsonFromText(claudeEatResponse);
    expect(result).not.toBeNull();

    const parsed = JSON.parse(result!);
    expect(parsed.expectedAnswerType).toBe("number");
    expect(parsed.confidence).toBe(0.95);
    expect(parsed.reasoning).toContain("Wie viel");
  });
});

// ---------------------------------------------------------------------------
// generateObjectWithRetry
// ---------------------------------------------------------------------------

describe("generateObjectWithRetry", () => {
  beforeEach(() => {
    setSuccess({});
    mockGenerateObject.mockClear();
  });

  // ── Happy path ────────────────────────────────────────────────────────────

  test("returns the object on a successful first attempt", async () => {
    const payload = { answer: 42 };
    setSuccess(payload);
    const result = await generateObjectWithRetry({ model: fakeModel, schema: anyObjectSchema, prompt: "test" }, 3);
    expect(result.object).toEqual(payload);
  });

  test("calls generateObject exactly once when the first attempt succeeds", async () => {
    setSuccess({ ok: true });
    await generateObjectWithRetry({ model: fakeModel, schema: anyObjectSchema, prompt: "once" }, 3);
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
  });

  test("passes the system prompt unchanged to generateObject", async () => {
    setSuccess({});
    await generateObjectWithRetry({
      model: fakeModel,
      schema: anyObjectSchema,
      system: "my system",
      prompt: "my prompt",
    });
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(callArg.system).toBe("my system");
  });

  test("passes the original prompt unchanged on the first attempt", async () => {
    setSuccess({});
    await generateObjectWithRetry({
      model: fakeModel,
      schema: anyObjectSchema,
      prompt: "original prompt",
    });
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(callArg.prompt).toBe("original prompt");
  });

  test("passes the model to generateObject", async () => {
    setSuccess({});
    await generateObjectWithRetry({ model: fakeModel, schema: anyObjectSchema, prompt: "p" });
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(callArg.model).toBe(fakeModel);
  });

  // ── Markdown-extraction recovery (no extra LLM call) ─────────────────────

  test("extracts and returns valid JSON from a markdown-wrapped error (AI_NoObjectGeneratedError)", async () => {
    const nerdPayload = {
      entities: [{ entity: "Connewitz", type: "DISTRICT", start: 28, end: 37, confidence: 0.95 }],
    };
    const markdownText = `Analysis:\n\`\`\`json\n${JSON.stringify(nerdPayload)}\n\`\`\`\nDone.`;
    setError(makeParseError(markdownText, "AI_NoObjectGeneratedError"));

    const result = await generateObjectWithRetry(
      { model: fakeModel, schema: nerdSchema, prompt: "detect entities" },
      3
    );

    expect((result.object as typeof nerdPayload).entities).toHaveLength(1);
    expect((result.object as typeof nerdPayload).entities[0]!.entity).toBe("Connewitz");
  });

  test("extracts and returns valid JSON from a markdown-wrapped error (AI_JSONParseError)", async () => {
    const eatPayload = { expectedAnswerType: "number", confidence: 0.97 };
    const markdownText = "My classification:\n```json\n" + JSON.stringify(eatPayload, null, 2) + "\n```\nEnd.";
    setError(makeParseError(markdownText, "AI_JSONParseError"));

    const result = await generateObjectWithRetry({ model: fakeModel, schema: eatSchema, prompt: "classify" }, 3);

    expect((result.object as typeof eatPayload).expectedAnswerType).toBe("number");
    expect((result.object as typeof eatPayload).confidence).toBe(0.97);
  });

  test("does NOT make an additional LLM call when JSON is successfully extracted from error text", async () => {
    const payload = {
      entities: [{ entity: "Leipzig", type: "CITY", start: 0, end: 7, confidence: 1 }],
    };
    setError(makeParseError(`\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``));

    await generateObjectWithRetry({ model: fakeModel, schema: nerdSchema, prompt: "nerd" }, 3);

    // Only 1 call: the failed attempt.  Extraction resolved it without a retry.
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
  });

  // ── Exact error-log scenario: claude-3.5-haiku nerd-simple ───────────────

  test("recovers from the exact claude-3.5-haiku nerd-simple error-log response", async () => {
    const question = "Wie viel wurde im Stadtteil Connewitz gegossen?";
    // Correct offsets: "Connewitz" starts at 28 in the question.
    const correctStart = question.indexOf("Connewitz"); // 28
    const correctEnd = correctStart + "Connewitz".length; // 37

    // This is the verbatim `text` property logged by the AI SDK error.
    const claudeRawText =
      "I'll help you detect and recognize the named entities in this question. Here's the analysis:\n\n" +
      "```json\n" +
      "{\n" +
      '  "entities": [\n' +
      "    {\n" +
      '      "entity": "Connewitz",\n' +
      '      "type": "DISTRICT",\n' +
      `      "start": ${correctStart},\n` +
      `      "end": ${correctEnd},\n` +
      '      "confidence": 0.95\n' +
      "    }\n" +
      "  ]\n" +
      "}\n" +
      "```\n\n" +
      "Explanation:\n" +
      '- "Connewitz" is recognized as a DISTRICT.\n' +
      "- The entity starts at character offset 28 and ends at character offset 37.\n" +
      "- Confidence is set high (0.95) as this is a clear, unambiguous district name.\n" +
      "- No other named entities were detected in this question.\n\n" +
      'The question translates to: "How much was watered in the Connewitz district?"';

    setError(makeParseError(claudeRawText));

    const result = await generateObjectWithRetry(
      { model: fakeModel, schema: nerdSchema, prompt: `Detect entities in: "${question}"` },
      3
    );

    const entities = (result.object as { entities: Array<Record<string, unknown>> }).entities;
    expect(entities).toHaveLength(1);
    expect(entities[0]!.entity).toBe("Connewitz");
    expect(entities[0]!.type).toBe("DISTRICT");
    // Resolved by extraction — no extra LLM call.
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
  });

  // ── Exact error-log scenario: claude-3.5-haiku eat-simple ────────────────

  test("recovers from a claude-3.5-haiku eat-simple markdown-wrapped EAT response", async () => {
    const question = "Wie viel wurde im Stadtteil Connewitz gegossen?";

    const claudeEatRawText =
      "I'll classify the expected answer type for this question.\n\n" +
      "```json\n" +
      "{\n" +
      '  "expectedAnswerType": "number",\n' +
      '  "confidence": 0.95,\n' +
      '  "reasoning": "The question asks for a quantity with \'Wie viel\', indicating a numeric answer."\n' +
      "}\n" +
      "```\n\n" +
      'The expected answer type is "number" since "Wie viel" (How much/many) asks for a numeric value.';

    setError(makeParseError(claudeEatRawText));

    const result = await generateObjectWithRetry(
      { model: fakeModel, schema: eatSchema, prompt: `Classify: "${question}"` },
      3
    );

    const eat = result.object as { expectedAnswerType: string; confidence: number };
    expect(eat.expectedAnswerType).toBe("number");
    expect(eat.confidence).toBe(0.95);
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
  });

  // ── Retry behaviour ───────────────────────────────────────────────────────

  test("retries when extraction is impossible and eventually succeeds on a later attempt", async () => {
    const successPayload = { entities: [] };
    let callCount = 0;

    mockGenerateObjectImpl = async () => {
      callCount++;
      if (callCount < 3) {
        // Error has no `text` property → extraction is impossible.
        throw new Error("transient LLM failure");
      }
      return { object: successPayload };
    };

    const result = await generateObjectWithRetry({ model: fakeModel, schema: nerdSchema, prompt: "retry test" }, 3);

    expect(result.object).toEqual(successPayload);
    expect(callCount).toBe(3);
  });

  test("appends a JSON reminder to the prompt on every retry", async () => {
    const capturedPrompts: string[] = [];
    let callCount = 0;

    mockGenerateObjectImpl = async (opts: unknown) => {
      capturedPrompts.push((opts as Record<string, unknown>).prompt as string);
      callCount++;
      if (callCount < 3) throw new Error("fail");
      return { object: {} };
    };

    await generateObjectWithRetry({ model: fakeModel, schema: anyObjectSchema, prompt: "original prompt" }, 3);

    // First call: prompt is passed unchanged.
    expect(capturedPrompts[0]).toBe("original prompt");
    // Subsequent calls: the original prompt is still present AND a JSON reminder is appended.
    expect(capturedPrompts[1]).toContain("original prompt");
    expect(capturedPrompts[1]).toContain("IMPORTANT");
    expect(capturedPrompts[1]).toContain("valid JSON");
    expect(capturedPrompts[2]).toContain("original prompt");
    expect(capturedPrompts[2]).toContain("IMPORTANT");
  });

  test("calls generateObject at most maxRetries times when all attempts fail without extractable text", async () => {
    setError(new Error("always fails — no text property"));

    try {
      await generateObjectWithRetry({ model: fakeModel, schema: anyObjectSchema, prompt: "fail" }, 3);
    } catch {
      // Expected.
    }

    expect(mockGenerateObject).toHaveBeenCalledTimes(3);
  });

  test("throws the last error after all retries are exhausted", async () => {
    const terminal = new Error("terminal failure");
    setError(terminal);

    await expect(
      generateObjectWithRetry({ model: fakeModel, schema: anyObjectSchema, prompt: "throw" }, 2)
    ).rejects.toThrow("terminal failure");
  });

  test("respects maxRetries = 1 — does not retry at all", async () => {
    setError(new Error("no retry"));

    try {
      await generateObjectWithRetry({ model: fakeModel, schema: anyObjectSchema, prompt: "once" }, 1);
    } catch {
      /* expected */
    }

    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
  });

  // ── Schema validation during extraction ───────────────────────────────────

  test("falls through to a retry when extracted JSON does not match the schema", async () => {
    // First call: error with JSON that has the wrong shape for nerdSchema.
    const successPayload = { entities: [] };
    let callCount = 0;

    mockGenerateObjectImpl = async () => {
      callCount++;
      if (callCount === 1) {
        // JSON is valid but fails nerdSchema validation (wrong key).
        throw makeParseError('```json\n{"wrong_key":true}\n```');
      }
      return { object: successPayload };
    };

    const result = await generateObjectWithRetry(
      { model: fakeModel, schema: nerdSchema, prompt: "schema mismatch" },
      3
    );

    expect(result.object).toEqual(successPayload);
    expect(callCount).toBe(2);
  });

  test("falls through to a retry when the error carries no text property", async () => {
    const successPayload = { entities: [] };
    let callCount = 0;

    mockGenerateObjectImpl = async () => {
      callCount++;
      if (callCount === 1) throw new Error("plain error — no text");
      return { object: successPayload };
    };

    const result = await generateObjectWithRetry({ model: fakeModel, schema: nerdSchema, prompt: "no text" }, 3);

    expect(result.object).toEqual(successPayload);
    expect(callCount).toBe(2);
  });

  test("falls through to a retry when error text contains no JSON", async () => {
    const successPayload = { entities: [] };
    let callCount = 0;

    mockGenerateObjectImpl = async () => {
      callCount++;
      if (callCount === 1) {
        throw makeParseError("This is a failure message with no JSON content at all.");
      }
      return { object: successPayload };
    };

    const result = await generateObjectWithRetry(
      { model: fakeModel, schema: nerdSchema, prompt: "no json in text" },
      3
    );

    expect(result.object).toEqual(successPayload);
    expect(callCount).toBe(2);
  });
});
