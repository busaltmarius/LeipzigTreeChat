import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mocks – all external dependencies are replaced before importing the handler
// ---------------------------------------------------------------------------

let mockQuestion: string | null = null;
let mockClassifyResult: {
  expectedAnswerType: string;
  confidence: number;
  reasoning?: string;
} | null = null;

mock.module("../eat-classifier.ts", () => ({
  classifyExpectedAnswerType: mock(async () => mockClassifyResult),
  eatTypeToUrl: (eatType: string) => new URL(`urn:qanary:eat#${eatType}`),
  EAT_TYPES: ["object", "list", "number", "bool", "string", "datetime", "date", "time", "timestamp", "enumeration"],
}));

mock.module("@leipzigtreechat/shared", () => ({
  getQuestion: mock(async () => mockQuestion),
  QANARY_PREFIX: "urn:qanary#",
  QANARY_EAT_PREFIX: "urn:qanary:eat#",
}));

const mockCreateAnnotation = mock(async () => {});
const mockCreateClarificationAnnotation = mock(async () => {});
const mockGenerateClarificationQuestion = mock(async () => "Können Sie Ihre Frage präzisieren?");

mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
  createAnnotationInKnowledgeGraph: mockCreateAnnotation,
  createClarificationAnnotation: mockCreateClarificationAnnotation,
  generateClarificationQuestion: mockGenerateClarificationQuestion,
}));

const { handler } = await import("../handler.ts");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeMessage = (id = "test") =>
  ({
    endpoint: "http://localhost:8890/sparql/",
    inGraph: `urn:graph:${id}`,
    outGraph: `urn:graph:${id}`,
  }) as any;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EAT-simple handler – clarification questions", () => {
  beforeEach(() => {
    mockQuestion = null;
    mockClassifyResult = null;
    mockCreateAnnotation.mockClear();
    mockCreateClarificationAnnotation.mockClear();
    mockGenerateClarificationQuestion.mockClear();
  });

  // ── No clarification when everything is fine ──────────────────────────

  test("does NOT generate a clarification when classification succeeds with high confidence", async () => {
    mockQuestion = "Wie viele Bäume gibt es in Connewitz?";
    mockClassifyResult = { expectedAnswerType: "number", confidence: 0.95 };

    await handler(makeMessage());

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
    // The normal annotation should still be written
    expect(mockCreateAnnotation).toHaveBeenCalledTimes(1);
  });

  test("does NOT generate a clarification when confidence equals the threshold exactly", async () => {
    mockQuestion = "Welche Bäume stehen in der Nähe?";
    mockClassifyResult = { expectedAnswerType: "list", confidence: 0.5 };

    await handler(makeMessage());

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
    expect(mockCreateAnnotation).toHaveBeenCalledTimes(1);
  });

  // ── No clarification when classification returns null ─────────────────

  test("does NOT generate a clarification when classifyExpectedAnswerType returns null", async () => {
    mockQuestion = "Erzähl mir etwas über Bäume.";
    mockClassifyResult = null;

    await handler(makeMessage());

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("does NOT write a normal annotation when classification is null", async () => {
    mockQuestion = "Was genau meinst du?";
    mockClassifyResult = null;

    await handler(makeMessage());

    expect(mockCreateAnnotation).not.toHaveBeenCalled();
  });

  // ── Clarification when confidence is low ──────────────────────────────

  test("generates a clarification when confidence is below the threshold", async () => {
    mockQuestion = "Bäume in Leipzig?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.3 };

    await handler(makeMessage());

    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).toHaveBeenCalledTimes(1);
  });

  test("still writes the normal annotation even when confidence is low", async () => {
    mockQuestion = "Bäume in Leipzig?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.3 };

    await handler(makeMessage());

    // Both the regular annotation AND the clarification should be written
    expect(mockCreateAnnotation).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).toHaveBeenCalledTimes(1);
  });

  test("mentions the low confidence in the ambiguity description (German)", async () => {
    mockQuestion = "Leipzig?";
    mockClassifyResult = { expectedAnswerType: "string", confidence: 0.2 };

    await handler(makeMessage());

    const ctx = mockGenerateClarificationQuestion.mock.calls[0]?.[0] as any;
    expect(ctx.ambiguityDescription).toContain("niedriger Konfidenz");
    expect(ctx.ambiguityDescription).toContain("0.2");
    expect(ctx.ambiguityDescription).toContain("string");
  });

  test("writes the LLM-generated text as clarification annotation when confidence is low", async () => {
    mockQuestion = "Was ist das?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.2 };

    const clarificationText = "Erwarten Sie eine Zahl, eine Liste oder einen Namen?";
    mockGenerateClarificationQuestion.mockImplementation(async () => clarificationText);

    const msg = makeMessage("low-confidence");
    await handler(msg);

    expect(mockCreateClarificationAnnotation).toHaveBeenCalledTimes(1);
    const opts = mockCreateClarificationAnnotation.mock.calls[0]?.[0] as any;
    expect(opts.message).toBe(msg);
    expect(opts.componentName).toBe("qanary-component-eat-simple");
    expect(opts.clarificationQuestion).toBe(clarificationText);
  });

  // ── Edge cases ────────────────────────────────────────────────────────

  test("does NOT generate a clarification when no question is found", async () => {
    mockQuestion = null;
    mockClassifyResult = null;

    await handler(makeMessage());

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("still returns the message when clarification generation returns null", async () => {
    mockQuestion = "Test?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.2 };
    mockGenerateClarificationQuestion.mockImplementation(async () => null);

    const msg = makeMessage();
    const result = await handler(msg);

    expect(result).toStrictEqual(msg);
    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("handler does not throw when generateClarificationQuestion throws", async () => {
    mockQuestion = "Was?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.1 };
    mockGenerateClarificationQuestion.mockImplementation(async () => {
      throw new Error("LLM exploded");
    });

    const msg = makeMessage();
    const result = await handler(msg);

    // Should still return the message
    expect(result).toStrictEqual(msg);
  });

  test("handler does not throw when createClarificationAnnotation throws", async () => {
    mockQuestion = "Was?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.1 };
    mockGenerateClarificationQuestion.mockImplementation(async () => "Was meinen Sie genau?");
    mockCreateClarificationAnnotation.mockImplementation(async () => {
      throw new Error("SPARQL write failed");
    });

    const msg = makeMessage();
    const result = await handler(msg);

    expect(result).toStrictEqual(msg);
    // Normal annotation should still have been attempted
    expect(mockCreateAnnotation).toHaveBeenCalledTimes(1);
  });

  test("returns the original message on successful classification with clarification", async () => {
    mockQuestion = "Was?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.3 };
    mockGenerateClarificationQuestion.mockImplementation(async () => "Können Sie Ihre Frage präzisieren?");

    const msg = makeMessage("return-check");
    const result = await handler(msg);

    expect(result).toStrictEqual(msg);
  });
});
