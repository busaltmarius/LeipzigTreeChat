import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockAnnotations: Array<{
  annotationUri: string;
  spotResourceUri: string;
  entityType: string;
  score: number;
  exactQuote: string;
  start: number;
  end: number;
  questionUri: string;
}> = [];

let mockDisambiguateOutcome: {
  result: { entityUrn: string; score: number; label: string } | null;
  candidates: { entityUrn: string; score: number; label: string }[];
} = { result: null, candidates: [] };

const mockFetchNerAnnotations = mock(async () => mockAnnotations);
const mockDisambiguate = mock(async () => mockDisambiguateOutcome);
const mockWriteDisambiguationAnnotation = mock(async () => {});

mock.module("../implementation.ts", () => ({
  fetchNerAnnotations: mockFetchNerAnnotations,
  disambiguate: mockDisambiguate,
  writeDisambiguationAnnotation: mockWriteDisambiguationAnnotation,
}));

mock.module("@leipzigtreechat/shared", () => ({
  getQuestion: mock(async () => null),
  getEndpoint: mock(() => "http://localhost:8890/sparql/"),
  getInGraph: mock(() => "urn:test:graph"),
  QANARY_PREFIX: "urn:qanary#",
  selectSparql: mock(async () => []),
  updateSparql: mock(async () => {}),
  createAnnotationInKnowledgeGraph: mock(async () => {}),
}));

let mockQuestion: string | null = "Welche Eichen gibt es in Connewitz?";
let mockClarificationText: string | null = "Meinten Sie die Stieleiche oder die Traubeneiche?";

const mockGetQuestion = mock(async () => mockQuestion);
const mockGetQuestionUri = mock(async () => "http://localhost:8080/question/stored-question__text_test");
const mockGenerateClarificationQuestion = mock(async () => mockClarificationText);
const mockCreateClarificationAnnotation = mock(async () => {});

mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
  getQuestionUri: mockGetQuestionUri,
  getQuestion: mockGetQuestion,
  createAnnotationInKnowledgeGraph: mock(async () => {}),
  generateClarificationQuestion: mockGenerateClarificationQuestion,
  createClarificationAnnotation: mockCreateClarificationAnnotation,
}));

const { handler } = await import("../handler.ts");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeAnnotation = (overrides: Partial<(typeof mockAnnotations)[0]> = {}) => ({
  annotationUri: "urn:qanary:annotation:ner-1",
  spotResourceUri: "urn:qanary:target:1",
  entityType: "TREE",
  score: 0.9,
  exactQuote: "Eichen",
  start: 7,
  end: 13,
  questionUri: "http://localhost:8080/question/stored-question__text_test",
  ...overrides,
});

const testMessage = {
  endpoint: "http://localhost:8890/sparql/",
  inGraph: "urn:test:graph",
  outGraph: "urn:test:graph",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DIS handler — clarification questions", () => {
  beforeEach(() => {
    mockAnnotations = [];
    mockDisambiguateOutcome = { result: null, candidates: [] };
    mockQuestion = "Welche Eichen gibt es in Connewitz?";
    mockClarificationText = "Meinten Sie die Stieleiche oder die Traubeneiche?";

    mockFetchNerAnnotations.mockClear();
    mockDisambiguate.mockClear();
    mockDisambiguate.mockImplementation(async () => mockDisambiguateOutcome);
    mockWriteDisambiguationAnnotation.mockClear();
    mockGetQuestion.mockClear();
    mockGetQuestion.mockImplementation(async () => mockQuestion);
    mockGenerateClarificationQuestion.mockClear();
    mockGenerateClarificationQuestion.mockImplementation(async () => mockClarificationText);
    mockCreateClarificationAnnotation.mockClear();
    mockCreateClarificationAnnotation.mockImplementation(async () => {});
  });

  test("generates and writes a clarification when multiple candidates are found", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
      candidates: [
        { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
        { entityUrn: "urn:tree:traubeneiche", score: 0.8, label: "Traubeneiche" },
      ],
    };

    await handler(testMessage);

    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).toHaveBeenCalledTimes(1);

    const annotationArg = mockCreateClarificationAnnotation.mock.calls[0]![0] as any;
    expect(annotationArg.componentName).toBe("qanary-component-dis");
    expect(annotationArg.clarificationQuestion).toBe("Meinten Sie die Stieleiche oder die Traubeneiche?");
  });

  test("passes the candidate labels in the ambiguity description", async () => {
    mockAnnotations = [makeAnnotation({ exactQuote: "Eichen", entityType: "TREE" })];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
      candidates: [
        { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
        { entityUrn: "urn:tree:traubeneiche", score: 0.8, label: "Traubeneiche" },
      ],
    };

    await handler(testMessage);

    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    const ctx = mockGenerateClarificationQuestion.mock.calls[0]![0] as any;
    expect(ctx.ambiguityDescription).toContain('"Stieleiche"');
    expect(ctx.ambiguityDescription).toContain('"Traubeneiche"');
    expect(ctx.ambiguityDescription).toContain('"Eichen"');
  });

  test("does NOT generate a clarification when only one candidate matches", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
      candidates: [{ entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" }],
    };

    await handler(testMessage);

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("does NOT generate a clarification when disambiguation fails (no candidates)", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = { result: null, candidates: [] };

    await handler(testMessage);

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("does NOT generate a clarification when there are no NER annotations", async () => {
    mockAnnotations = [];

    await handler(testMessage);

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("does not write annotation when LLM returns null for clarification", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
      candidates: [
        { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
        { entityUrn: "urn:tree:traubeneiche", score: 0.8, label: "Traubeneiche" },
      ],
    };
    mockClarificationText = null;

    await handler(testMessage);

    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("skips clarification when question text cannot be fetched", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
      candidates: [
        { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
        { entityUrn: "urn:tree:traubeneiche", score: 0.8, label: "Traubeneiche" },
      ],
    };
    mockQuestion = null;

    await handler(testMessage);

    expect(mockGenerateClarificationQuestion).not.toHaveBeenCalled();
    expect(mockCreateClarificationAnnotation).not.toHaveBeenCalled();
  });

  test("handler still returns the message even when clarification generation fails", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
      candidates: [
        { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
        { entityUrn: "urn:tree:traubeneiche", score: 0.8, label: "Traubeneiche" },
      ],
    };
    mockGenerateClarificationQuestion.mockImplementationOnce(async () => {
      throw new Error("LLM unavailable");
    });

    const result = await handler(testMessage);
    expect(result).toStrictEqual(testMessage);
  });

  test("passes the original question text in the clarification context", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:birke", score: 0.85, label: "Birke" },
      candidates: [
        { entityUrn: "urn:tree:birke", score: 0.85, label: "Birke" },
        { entityUrn: "urn:tree:haengebirke", score: 0.8, label: "Hängebirke" },
      ],
    };
    mockQuestion = "Wo stehen Birken in Leipzig?";

    await handler(testMessage);

    const ctx = mockGenerateClarificationQuestion.mock.calls[0]![0] as any;
    expect(ctx.question).toBe("Wo stehen Birken in Leipzig?");
    expect(ctx.componentName).toBe("qanary-component-dis");
  });

  test("still writes disambiguation annotation when multiple candidates are found", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
      candidates: [
        { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
        { entityUrn: "urn:tree:traubeneiche", score: 0.8, label: "Traubeneiche" },
      ],
    };

    await handler(testMessage);

    // The best match is still written as disambiguation annotation
    expect(mockWriteDisambiguationAnnotation).toHaveBeenCalledTimes(1);
    // And clarification is also generated
    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).toHaveBeenCalledTimes(1);
  });

  test("writes clarification only for the ambiguous entity in a mixed batch", async () => {
    mockAnnotations = [
      makeAnnotation({ exactQuote: "Eichen", entityType: "TREE" }),
      makeAnnotation({
        annotationUri: "urn:qanary:annotation:ner-2",
        exactQuote: "Connewitz",
        entityType: "DISTRICT",
      }),
    ];

    let callCount = 0;
    mockDisambiguate.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        // First entity: multiple candidates → ambiguous
        return {
          result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
          candidates: [
            { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
            { entityUrn: "urn:tree:traubeneiche", score: 0.8, label: "Traubeneiche" },
          ],
        };
      }
      // Second entity: single candidate → clear
      return {
        result: { entityUrn: "urn:district:connewitz", score: 0.95, label: "Connewitz" },
        candidates: [{ entityUrn: "urn:district:connewitz", score: 0.95, label: "Connewitz" }],
      };
    });

    await handler(testMessage);

    // Both disambiguations succeed
    expect(mockWriteDisambiguationAnnotation).toHaveBeenCalledTimes(2);

    // Clarification only for the ambiguous entity
    expect(mockGenerateClarificationQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateClarificationAnnotation).toHaveBeenCalledTimes(1);

    const ctx = mockGenerateClarificationQuestion.mock.calls[0]![0] as any;
    expect(ctx.ambiguityDescription).toContain('"Eichen"');
    expect(ctx.ambiguityDescription).not.toContain('"Connewitz"');
  });

  test("passes the IQanaryMessage through to createClarificationAnnotation", async () => {
    mockAnnotations = [makeAnnotation()];
    mockDisambiguateOutcome = {
      result: { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
      candidates: [
        { entityUrn: "urn:tree:stieleiche", score: 0.85, label: "Stieleiche" },
        { entityUrn: "urn:tree:traubeneiche", score: 0.8, label: "Traubeneiche" },
      ],
    };

    await handler(testMessage);

    const annotationArg = mockCreateClarificationAnnotation.mock.calls[0]![0] as any;
    expect(annotationArg.message).toStrictEqual(testMessage);
  });
});
