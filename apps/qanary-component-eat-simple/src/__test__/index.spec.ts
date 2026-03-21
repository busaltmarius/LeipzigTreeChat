import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mock the eat-classifier module so the handler never calls a real LLM.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mock shared helpers: getQuestion and createAnnotationInKnowledgeGraph.
// ---------------------------------------------------------------------------

let mockQuestion: string | null = null;

mock.module("@leipzigtreechat/shared", () => ({
  getQuestion: mock(async () => mockQuestion),
  QANARY_PREFIX: "urn:qanary#",
  QANARY_EAT_PREFIX: "urn:qanary:eat#",
}));

const mockCreateAnnotation = mock(async () => {});
const mockCreateClarificationAnnotation = mock(async () => {});
const mockGenerateClarificationQuestion = mock(async () => null);

mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
  createAnnotationInKnowledgeGraph: mockCreateAnnotation,
  createClarificationAnnotation: mockCreateClarificationAnnotation,
  generateClarificationQuestion: mockGenerateClarificationQuestion,
}));

// Import AFTER all mocks are registered.
const { handler } = await import("../handler.ts");

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("#Component handler", () => {
  beforeEach(() => {
    mockQuestion = null;
    mockClassifyResult = null;
    mockCreateAnnotation.mockClear();
  });

  test("returns the original message unchanged when no question is present", async () => {
    mockQuestion = null;
    const message = { graphId: "test-graph-1" };
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });

  test("does not write to the knowledge graph when no question is found", async () => {
    mockQuestion = null;
    await handler({});
    expect(mockCreateAnnotation).not.toHaveBeenCalled();
  });

  test("returns the original message unchanged when the LLM returns null", async () => {
    mockQuestion = "Was ist Photosynthese?";
    mockClassifyResult = null;
    const message = { graphId: "test-graph-2" };
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });

  test("does not write to the knowledge graph when the LLM returns null", async () => {
    mockQuestion = "Was ist Photosynthese?";
    mockClassifyResult = null;
    await handler({});
    expect(mockCreateAnnotation).not.toHaveBeenCalled();
  });

  test("writes exactly one annotation to the knowledge graph on success", async () => {
    mockQuestion = "Welche Bäume stehen in Connewitz?";
    mockClassifyResult = { expectedAnswerType: "list", confidence: 0.97 };

    await handler({ graphId: "test-graph-3" });

    expect(mockCreateAnnotation).toHaveBeenCalledTimes(1);
  });

  test("stores the correct EAT URL in the annotation value", async () => {
    mockQuestion = "Wie viele Bäume gibt es?";
    mockClassifyResult = { expectedAnswerType: "number", confidence: 0.99 };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.annotation.value).toBe("urn:qanary:eat#number");
  });

  test("stores the LLM confidence in the annotation", async () => {
    mockQuestion = "Wer hat den Baum gepflanzt?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.85 };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.annotation.confidence).toBe(0.85);
  });

  test("uses the correct Qanary annotation type", async () => {
    mockQuestion = "Wann wurde der Baum gegossen?";
    mockClassifyResult = { expectedAnswerType: "datetime", confidence: 0.9 };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.annotationType).toBe("urn:qanary#AnnotationOfExpectedAnswerType");
  });

  test("sets annotation range spanning the full question", async () => {
    const question = "Welchen Baum kann ich gießen?";
    mockQuestion = question;
    mockClassifyResult = { expectedAnswerType: "object", confidence: 1 };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.annotation.range.start).toBe(0);
    expect(callArg.annotation.range.end).toBe(question.length);
  });

  test("returns the original message on success", async () => {
    mockQuestion = "Wo wächst die älteste Eiche?";
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.95 };

    const message = { graphId: "test-graph-success" };
    const result = await handler(message);

    expect(result).toStrictEqual(message);
  });

  test("handler does not fail with an empty message object", async () => {
    const result = await handler({});
    expect(result).toStrictEqual({});
  });

  test("writes the component name to the annotation call", async () => {
    mockQuestion = "Wie viele Linden gibt es in Gohlis?";
    mockClassifyResult = { expectedAnswerType: "number", confidence: 0.92 };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.componentName).toBe("qanary-component-eat-simple");
  });
});
