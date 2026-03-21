import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

type KnownRelationType =
  | "UNKNOWN"
  | "AMOUNT_WATERED_DISTRICT"
  | "SPONSORED_TREES"
  | "WATERABLE_TREES_AT_ADDRESS"
  | "TREES_BY_SPECIES_DISTRICT"
  | "WATERABLE_TREES_AT_KITA";

// ---------------------------------------------------------------------------
// Mutable state that tests can control
// ---------------------------------------------------------------------------

let mockRelationResult: {
  relationType: KnownRelationType | string;
  confidence: number;
} | null = null;
let mockQuestion: string | null = null;

// ---------------------------------------------------------------------------
// Mock: relation-classifier
// ---------------------------------------------------------------------------

mock.module("../relation-classifier.ts", () => ({
  classifyRelationType: mock(async () => mockRelationResult),
  KNOWN_RELATION_TYPES: [
    "UNKNOWN",
    "AMOUNT_WATERED_DISTRICT",
    "SPONSORED_TREES",
    "WATERABLE_TREES_AT_ADDRESS",
    "TREES_BY_SPECIES_DISTRICT",
    "WATERABLE_TREES_AT_KITA",
  ],
}));

// ---------------------------------------------------------------------------
// Mock: @leipzigtreechat/shared
// ---------------------------------------------------------------------------

mock.module("@leipzigtreechat/shared", () => ({
  QANARY_PREFIX: "urn:qanary#",
}));

// ---------------------------------------------------------------------------
// Mock: @leipzigtreechat/qanary-component-helpers
// ---------------------------------------------------------------------------

const mockUpdateSparql = mock(async () => {});
const mockGenerateClarificationQuestion = mock(async (_ctx: any) => "Rückfrage vom LLM");
const mockCreateClarificationAnnotation = mock(async (_opts: any) => {});

mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
  getOutGraph: mock(() => "urn:graph:out"),
  getEndpoint: mock(() => "http://localhost:8890/sparql/"),
  getQuestion: mock(async () => mockQuestion),
  getQuestionUri: mock(async () => "urn:qanary:question:123"),
  updateSparql: mockUpdateSparql,
  generateClarificationQuestion: mockGenerateClarificationQuestion,
  createClarificationAnnotation: mockCreateClarificationAnnotation,
}));

// ---------------------------------------------------------------------------
// Import handler *after* mocks are in place
// ---------------------------------------------------------------------------

const { handler } = await import("../handler.ts");

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("relation-detection clarification questions", () => {
  beforeEach(() => {
    mockQuestion = null;
    mockRelationResult = null;
    mockUpdateSparql.mockClear();
    mockGenerateClarificationQuestion.mockClear();
    mockCreateClarificationAnnotation.mockClear();
  });

  // ── No question ─────────────────────────────────────────────────────────

  test("does NOT generate clarification when no question is found", async () => {
    mockQuestion = null;
    await handler({});

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  // ── Classification returns null → NO clarification ────────────────────

  test("does NOT generate clarification when classifyRelationType returns null", async () => {
    mockQuestion = "Was für Bäume gibt es?";
    mockRelationResult = null;

    const message = {
      endpoint: "http://e",
      inGraph: "urn:in",
      outGraph: "urn:out",
    } as any;
    const result = await handler(message);

    expect(result).toStrictEqual(message);
    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  // ── Invalid relation type → NO clarification ──────────────────────────

  test("does NOT generate clarification when relation type is not in KNOWN_RELATION_TYPES", async () => {
    mockQuestion = "Zeige mir etwas Seltsames";
    mockRelationResult = {
      relationType: "TOTALLY_INVALID_TYPE" as any,
      confidence: 0.9,
    };

    await handler({});

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  // ── UNKNOWN type with high confidence → NO clarification ──────────────

  test("does NOT generate clarification when relation type is UNKNOWN with high confidence", async () => {
    mockQuestion = "Erzähl mir etwas Lustiges";
    mockRelationResult = { relationType: "UNKNOWN", confidence: 0.8 };

    await handler({});

    // The SPARQL annotation for UNKNOWN is still written
    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);

    // But no clarification
    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  // ── Low confidence ──────────────────────────────────────────────────────

  test("generates clarification when confidence is below threshold (0.5)", async () => {
    mockQuestion = "Wie viel wurde gegossen?";
    mockRelationResult = {
      relationType: "AMOUNT_WATERED_DISTRICT",
      confidence: 0.3,
    };

    await handler({});

    // The relation annotation is still written
    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);

    // Clarification is triggered due to low confidence
    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    const ctx = mockGenerateClarificationQuestion.mock.calls[0]![0];
    expect(ctx.ambiguityDescription).toContain("niedriger Konfidenz");
    expect(ctx.ambiguityDescription).toContain("0.30");

    expect(mockCreateClarificationAnnotation).toHaveBeenCalledTimes(1);
  });

  test("generates clarification for UNKNOWN type with low confidence", async () => {
    mockQuestion = "Erzähl mir etwas Lustiges";
    mockRelationResult = { relationType: "UNKNOWN", confidence: 0.3 };

    await handler({});

    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);
    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).toHaveBeenCalledTimes(1);
  });

  test("does NOT generate clarification at exactly 0.5 confidence (threshold boundary)", async () => {
    mockQuestion = "Welche Bäume kann man gießen?";
    mockRelationResult = {
      relationType: "WATERABLE_TREES_AT_ADDRESS",
      confidence: 0.5,
    };

    await handler({});

    // 0.5 is NOT below 0.5, so no clarification
    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
    // But the annotation is still written
    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);
  });

  // ── High confidence, valid type → NO clarification ──────────────────────

  test("does NOT generate clarification when confidence is high and type is valid", async () => {
    mockQuestion = "Wie viel wurde im Stadtteil Connewitz gegossen?";
    mockRelationResult = {
      relationType: "AMOUNT_WATERED_DISTRICT",
      confidence: 0.95,
    };

    await handler({});

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();

    // Normal annotation is written
    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);
  });

  // ── LLM returns null → no annotation written ───────────────────────────

  test("does NOT write clarification annotation when LLM returns null", async () => {
    mockQuestion = "Irgendetwas?";
    mockRelationResult = {
      relationType: "AMOUNT_WATERED_DISTRICT",
      confidence: 0.2,
    };
    mockGenerateClarificationQuestion.mockImplementationOnce(async () => null);

    await handler({});

    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  // ── LLM throws → handler does not crash ─────────────────────────────────

  test("handler does not crash when generateClarificationQuestion throws", async () => {
    mockQuestion = "Frage?";
    mockRelationResult = {
      relationType: "AMOUNT_WATERED_DISTRICT",
      confidence: 0.2,
    };
    mockGenerateClarificationQuestion.mockImplementationOnce(async () => {
      throw new Error("LLM is down");
    });

    const message = { id: "crash-test" } as any;
    const result = await handler(message);

    // Still returns the original message
    expect(result).toStrictEqual(message);
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("handler does not crash when createClarificationAnnotation throws", async () => {
    mockQuestion = "Frage?";
    mockRelationResult = {
      relationType: "AMOUNT_WATERED_DISTRICT",
      confidence: 0.2,
    };
    mockCreateClarificationAnnotation.mockImplementationOnce(async () => {
      throw new Error("Triplestore write failed");
    });

    const message = { id: "crash-test-2" } as any;
    const result = await handler(message);

    expect(result).toStrictEqual(message);
  });

  // ── Returns original message in all paths ─────────────────────────────

  test("returns the original message when no relation result", async () => {
    mockQuestion = "Etwas?";
    mockRelationResult = null;

    const message = {
      endpoint: "ep",
      inGraph: "ig",
      outGraph: "og",
    } as any;
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });

  test("returns the original message when clarification is generated for low confidence", async () => {
    mockQuestion = "Etwas?";
    mockRelationResult = {
      relationType: "AMOUNT_WATERED_DISTRICT",
      confidence: 0.2,
    };

    const message = {
      endpoint: "ep",
      inGraph: "ig",
      outGraph: "og",
    } as any;
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });
});
