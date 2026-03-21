import { describe, expect, mock, test } from "bun:test";

mock.module("../implementation.ts", () => ({
  fetchNerAnnotations: mock(async () => []),
  disambiguate: mock(async () => ({ result: null, candidates: [] })),
  writeDisambiguationAnnotation: mock(async () => {}),
}));

mock.module("@leipzigtreechat/shared", () => ({
  getQuestion: mock(async () => "Wie viel wurde im Stadtteil Connewitz gegossen?"),
  getEndpoint: mock(() => "http://localhost:8890/sparql/"),
  getInGraph: mock(() => "urn:test:graph"),
  QANARY_PREFIX: "urn:qanary#",
  selectSparql: mock(async () => []),
  updateSparql: mock(async () => {}),
  createAnnotationInKnowledgeGraph: mock(async () => {}),
}));

// ← separater Mock für helpers
mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
  getQuestionUri: mock(async () => "http://localhost:8080/question/stored-question__text_test"),
  getQuestion: mock(async () => "Wie viel wurde im Stadtteil Connewitz gegossen?"),
  createAnnotationInKnowledgeGraph: mock(async () => {}),
  generateClarificationQuestion: mock(async () => null),
  createClarificationAnnotation: mock(async () => {}),
}));

describe("#Component handler", () => {
  test("handler does not fail with empty message", async () => {
    const { handler } = await import("../handler.ts");
    const result = await handler({});
    expect(result).toStrictEqual({});
  });

  test("handler returns the original message unchanged", async () => {
    const { handler } = await import("../handler.ts");
    const testMessage = {
      endpoint: "http://localhost:8890/sparql/",
      inGraph: "urn:test:graph",
      outGraph: "urn:test:graph",
    };
    const result = await handler(testMessage);
    expect(result).toStrictEqual(testMessage);
  });

  test("handler returns message when no question found", async () => {
    mock.module("@leipzigtreechat/shared", () => ({
      getQuestion: mock(async () => null),
      getEndpoint: mock(() => "http://localhost:8890/sparql/"),
      getInGraph: mock(() => "urn:test:graph"),
      QANARY_PREFIX: "urn:qanary#",
      selectSparql: mock(async () => []),
      updateSparql: mock(async () => {}),
      createAnnotationInKnowledgeGraph: mock(async () => {}),
    }));

    mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
      getQuestionUri: mock(async () => null),
      getQuestion: mock(async () => null),
      createAnnotationInKnowledgeGraph: mock(async () => {}),
      generateClarificationQuestion: mock(async () => null),
      createClarificationAnnotation: mock(async () => {}),
    }));

    const { handler: fn } = await import("../handler.ts");
    const testMessage = {
      endpoint: "http://localhost:8890/sparql/",
      inGraph: "urn:test:graph",
      outGraph: "urn:test:graph",
    };

    const result = await fn(testMessage);
    expect(result).toStrictEqual(testMessage);
  });

  test("handler catches and logs errors without throwing", async () => {
    mock.module("@leipzigtreechat/shared", () => ({
      getQuestion: mock(async () => {
        throw new Error("Test pipeline error");
      }),
      getEndpoint: mock(() => "http://localhost:8890/sparql/"),
      getInGraph: mock(() => "urn:test:graph"),
      QANARY_PREFIX: "urn:qanary#",
      selectSparql: mock(async () => []),
      updateSparql: mock(async () => {}),
      createAnnotationInKnowledgeGraph: mock(async () => {}),
    }));

    mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
      getQuestionUri: mock(async () => {
        throw new Error("Test pipeline error");
      }),
      getQuestion: mock(async () => null),
      createAnnotationInKnowledgeGraph: mock(async () => {}),
      generateClarificationQuestion: mock(async () => null),
      createClarificationAnnotation: mock(async () => {}),
    }));

    const { handler: fn } = await import("../handler.ts");
    const testMessage = {
      endpoint: "http://localhost:8890/sparql/",
      inGraph: "urn:test:graph",
      outGraph: "urn:test:graph",
    };

    const result = await fn(testMessage);
    expect(result).toStrictEqual(testMessage);
  });
});
