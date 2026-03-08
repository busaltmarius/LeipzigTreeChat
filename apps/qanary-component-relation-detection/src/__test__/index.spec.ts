import { beforeEach, describe, expect, mock, test } from "bun:test";

let mockRelationResult: { relationType: string; confidence: number } | null = null;
let mockQuestion: string | null = null;

// Mock the classifier
mock.module("../relation-classifier.ts", () => ({
  classifyRelationType: mock(async () => mockRelationResult),
}));

// Mock shared helpers
mock.module("@leipzigtreechat/shared", () => ({
  getQuestion: mock(async () => mockQuestion),
  QANARY_PREFIX: "http://www.wdaqua.eu/qa#",
}));

const mockUpdateSparql = mock(async () => {});

mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
  getOutGraph: mock(() => "http://urn.org/graph"),
  getEndpointUrl: mock(() => "http://urn.org/sparql"),
  getEndpoint: mock(() => "http://urn.org/sparql"),
  getQuestionUri: mock(async () => "urn:qanary:question:123"),
  updateSparql: mockUpdateSparql,
}));

// Import AFTER mocks are registered.
const { handler } = await import("../handler.ts");

describe("#Component handler", () => {
  beforeEach(() => {
    mockQuestion = null;
    mockRelationResult = null;
    mockUpdateSparql.mockClear();
  });

  test("handler returns the original message unchanged when no question is present", async () => {
    mockQuestion = null;
    const message = { graphId: "test-1" };
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });

  test("does not update SPARQL when no question is found", async () => {
    mockQuestion = null;
    await handler({});
    expect(mockUpdateSparql).not.toHaveBeenCalled();
  });

  test("returns the original message unchanged when the LLM returns null", async () => {
    mockQuestion = "Some question?";
    mockRelationResult = null;
    const message = { graphId: "test-2" };
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });

  test("inserts an AnnotationOfRelation when a relation is classified", async () => {
    mockQuestion = "Wie viel wurde im Stadtteil Connewitz gegossen?";
    mockRelationResult = {
      relationType: "AMOUNT_WATERED_DISTRICT",
      confidence: 0.95,
    };

    await handler({});

    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);
    const query = mockUpdateSparql.mock.calls[0][1];
    
    expect(query).toContain("a <http://www.wdaqua.eu/qa#AnnotationOfRelation>");
    expect(query).toContain("oa:hasTarget <urn:qanary:question:123>");
    expect(query).toContain("oa:hasBody <urn:leipzigtreechat:intent:AMOUNT_WATERED_DISTRICT>");
    expect(query).toContain("qa:score '0.95'^^xsd:double");
    expect(query).toContain("oa:annotatedBy <urn:leipzigtreechat:component:relation-detection>");
  });
});
