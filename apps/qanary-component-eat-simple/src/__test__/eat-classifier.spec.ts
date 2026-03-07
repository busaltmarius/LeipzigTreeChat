import { beforeEach, describe, expect, mock, test } from "bun:test";
import { QANARY_EAT_PREFIX } from "@leipzigtreechat/shared";

// ---------------------------------------------------------------------------
// Mock the "ai" module so generateObject never calls a real LLM.
// ---------------------------------------------------------------------------

type GenerateObjectResult = {
  expectedAnswerType: string;
  confidence: number;
  reasoning?: string;
};

let mockGenerateObjectResult: GenerateObjectResult = {
  expectedAnswerType: "object",
  confidence: 1,
};

let mockGenerateObjectError: Error | null = null;

const mockGenerateObject = mock(async () => {
  if (mockGenerateObjectError) {
    throw mockGenerateObjectError;
  }
  return { object: mockGenerateObjectResult };
});

mock.module("ai", () => ({
  generateObject: mockGenerateObject,
}));

// Import AFTER mocks are registered.
const { classifyExpectedAnswerType, eatTypeToUrl, EAT_TYPES } = await import("../eat-classifier.ts");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const eat = (type: string) => `${QANARY_EAT_PREFIX}${type}`;

/** A fake LanguageModel — only the identity matters, not the shape. */
const mockModel = { modelId: "mock-model" } as any;

/**
 * A model factory that injects the fake model.
 * Passed directly to classifyExpectedAnswerType via its modelFactory parameter,
 * so no module-level mock of getLlmModel is needed.
 */
const modelFactory = mock(() => mockModel);

const setResult = (type: string, confidence = 1, reasoning?: string) => {
  mockGenerateObjectResult = { expectedAnswerType: type, confidence, reasoning };
  mockGenerateObjectError = null;
};

// ---------------------------------------------------------------------------
// classifyExpectedAnswerType
// ---------------------------------------------------------------------------

describe("classifyExpectedAnswerType", () => {
  beforeEach(() => {
    setResult("object");
    mockGenerateObject.mockClear();
    modelFactory.mockClear();
  });

  // --- happy path: each EAT type -------------------------------------------

  test("returns object classification", async () => {
    setResult("object", 0.98);
    const result = await classifyExpectedAnswerType("Wer hat diesen Baum gepflanzt?", modelFactory);
    expect(result?.expectedAnswerType).toBe("object");
    expect(result?.confidence).toBe(0.98);
  });

  test("returns list classification", async () => {
    setResult("list", 0.95);
    const result = await classifyExpectedAnswerType("Welche Bäume stehen in Connewitz?", modelFactory);
    expect(result?.expectedAnswerType).toBe("list");
  });

  test("returns number classification", async () => {
    setResult("number", 0.99);
    const result = await classifyExpectedAnswerType("Wie viele Bäume gibt es in Reudnitz?", modelFactory);
    expect(result?.expectedAnswerType).toBe("number");
  });

  test("returns bool classification", async () => {
    setResult("bool", 0.92);
    const result = await classifyExpectedAnswerType("Steht in der Schillerstraße ein Baum?", modelFactory);
    expect(result?.expectedAnswerType).toBe("bool");
  });

  test("returns string classification", async () => {
    setResult("string", 0.88);
    const result = await classifyExpectedAnswerType("Wie heißt dieser Baum auf Lateinisch?", modelFactory);
    expect(result?.expectedAnswerType).toBe("string");
  });

  test("returns datetime classification", async () => {
    setResult("datetime", 0.91);
    const result = await classifyExpectedAnswerType("Wann wurde dieser Baum zuletzt gegossen?", modelFactory);
    expect(result?.expectedAnswerType).toBe("datetime");
  });

  test("returns date classification", async () => {
    setResult("date", 0.87);
    const result = await classifyExpectedAnswerType("An welchem Datum wurde dieser Baum gepflanzt?", modelFactory);
    expect(result?.expectedAnswerType).toBe("date");
  });

  test("returns time classification", async () => {
    setResult("time", 0.82);
    const result = await classifyExpectedAnswerType("Um wie viel Uhr öffnet das Stadtpark-Tor?", modelFactory);
    expect(result?.expectedAnswerType).toBe("time");
  });

  test("returns timestamp classification", async () => {
    setResult("timestamp", 0.79);
    const result = await classifyExpectedAnswerType(
      "Wann genau wurde die letzte Bewässerung protokolliert?",
      modelFactory
    );
    expect(result?.expectedAnswerType).toBe("timestamp");
  });

  test("returns enumeration classification", async () => {
    setResult("enumeration", 0.85);
    const result = await classifyExpectedAnswerType("Zu welcher Baumart gehört dieser Baum?", modelFactory);
    expect(result?.expectedAnswerType).toBe("enumeration");
  });

  // --- result shape --------------------------------------------------------

  test("returns a confidence value between 0 and 1", async () => {
    setResult("object", 0.75);
    const result = await classifyExpectedAnswerType("Wo wächst die älteste Eiche?", modelFactory);
    expect(result?.confidence).toBeGreaterThanOrEqual(0);
    expect(result?.confidence).toBeLessThanOrEqual(1);
  });

  test("returns optional reasoning when the model provides it", async () => {
    setResult("number", 0.96, "The question asks for a count.");
    const result = await classifyExpectedAnswerType("Wie viele Linden gibt es?", modelFactory);
    expect(result?.reasoning).toBe("The question asks for a count.");
  });

  test("reasoning is undefined when not provided by model", async () => {
    setResult("list", 0.9);
    const result = await classifyExpectedAnswerType("Welche Bäume stehen in Gohlis?", modelFactory);
    expect(result?.reasoning).toBeUndefined();
  });

  // --- LLM call mechanics --------------------------------------------------

  test("calls generateObject exactly once per invocation", async () => {
    await classifyExpectedAnswerType("Wie viele Bäume gibt es?", modelFactory);
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
  });

  test("passes the question inside the prompt string", async () => {
    const question = "Wie viele Linden gibt es in Gohlis?";
    await classifyExpectedAnswerType(question, modelFactory);
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as any;
    expect(callArg.prompt).toContain(question);
  });

  test("passes a system prompt to generateObject", async () => {
    await classifyExpectedAnswerType("Welche Bäume stehen in Leipzig?", modelFactory);
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as any;
    expect(typeof callArg.system).toBe("string");
    expect(callArg.system.length).toBeGreaterThan(0);
  });

  test("passes the model returned by the model factory to generateObject", async () => {
    await classifyExpectedAnswerType("Wo ist der nächste Baum?", modelFactory);
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as any;
    expect(callArg.model).toBe(mockModel);
  });

  test("invokes the provided model factory exactly once", async () => {
    await classifyExpectedAnswerType("Wie alt ist dieser Baum?", modelFactory);
    expect(modelFactory).toHaveBeenCalledTimes(1);
  });

  test("uses a different model when a custom factory is provided", async () => {
    const otherModel = { modelId: "other-mock-model" } as any;
    const otherFactory = mock(() => otherModel);

    await classifyExpectedAnswerType("Wie alt ist dieser Baum?", otherFactory);

    const callArg = mockGenerateObject.mock.calls[0]?.[0] as any;
    expect(callArg.model).toBe(otherModel);
  });

  // --- default factory (getLlmModel) is used when no factory is passed -----

  test("uses the default model factory when none is provided", async () => {
    // Provide the env var so getLlmModel does not throw.
    const original = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = "test-key";
    try {
      // We don't care about the result — just that it doesn't throw on
      // the factory path. generateObject is still mocked.
      const result = await classifyExpectedAnswerType("Wie viele Bäume gibt es?");
      expect(result?.expectedAnswerType).toBe("object");
    } finally {
      if (original === undefined) {
        delete process.env.OPENROUTER_API_KEY;
      } else {
        process.env.OPENROUTER_API_KEY = original;
      }
    }
  });

  // --- error handling ------------------------------------------------------

  test("returns null when generateObject throws", async () => {
    mockGenerateObjectError = new Error("Network error");
    const result = await classifyExpectedAnswerType("Wie viele Bäume gibt es in Leipzig?", modelFactory);
    expect(result).toBeNull();
  });

  test("does not propagate errors thrown by generateObject", async () => {
    mockGenerateObjectError = new Error("Upstream failure");
    await expect(classifyExpectedAnswerType("Welche Arten gibt es?", modelFactory)).resolves.toBeNull();
  });

  test("recovers correctly after a failed call", async () => {
    mockGenerateObjectError = new Error("Transient error");
    const failed = await classifyExpectedAnswerType("Fehlerhafte Anfrage", modelFactory);
    expect(failed).toBeNull();

    setResult("list", 0.9);
    const recovered = await classifyExpectedAnswerType("Welche Bäume?", modelFactory);
    expect(recovered?.expectedAnswerType).toBe("list");
  });

  test("returns null and does not throw when getLlmModel throws (no API key)", async () => {
    // Simulate a missing API key by passing a factory that throws.
    const throwingFactory = () => {
      throw new Error("Missing OPENROUTER_API_KEY");
    };
    const result = await classifyExpectedAnswerType("Wie viele Bäume gibt es?", throwingFactory);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// eatTypeToUrl
// ---------------------------------------------------------------------------

describe("eatTypeToUrl", () => {
  test("returns a URL instance", () => {
    const result = eatTypeToUrl("object");
    expect(result).toBeInstanceOf(URL);
  });

  test("includes the Qanary EAT prefix", () => {
    const result = eatTypeToUrl("number");
    expect(result.toString()).toStartWith(QANARY_EAT_PREFIX);
  });

  test.each(EAT_TYPES as unknown as string[])("produces correct URL for type '%s'", (type) => {
    const result = eatTypeToUrl(type as any);
    expect(result.toString()).toBe(eat(type));
  });
});

// ---------------------------------------------------------------------------
// EAT_TYPES constant
// ---------------------------------------------------------------------------

describe("EAT_TYPES", () => {
  test("contains all expected types", () => {
    const expected = [
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
    ];
    for (const type of expected) {
      expect(EAT_TYPES).toContain(type);
    }
  });

  test("has no duplicate entries", () => {
    const unique = new Set(EAT_TYPES);
    expect(unique.size).toBe(EAT_TYPES.length);
  });
});
