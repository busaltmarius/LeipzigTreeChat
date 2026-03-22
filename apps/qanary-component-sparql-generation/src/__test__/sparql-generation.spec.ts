import { beforeEach, describe, expect, mock, test } from "bun:test";

let mockQuestionUri: string | null = null;
let mockRelation: string | null = null;
let mockDataResults: any[] = [];

// Mock shared helpers
mock.module("@leipzigtreechat/shared", () => ({
  QANARY_PREFIX: "urn:qanary#",
}));

const mockUpdateSparql = mock(async () => {});
const mockSelectSparql = mock(async (url: string, query: string) => {
  // If it's the relation query
  if (query.includes("AnnotationOfRelation")) {
    return mockRelation ? [{ relationBody: { value: mockRelation } }] : [];
  }
  // If it's the predefined query (data)
  return mockDataResults;
});

mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
  getInGraph: mock(() => "http://urn.org/in-graph"),
  getOutGraph: mock(() => "http://urn.org/out-graph"),
  getEndpointUrl: mock(() => "http://urn.org/sparql"),
  getEndpoint: mock(() => "http://urn.org/sparql"),
  getQuestionUri: mock(async () => mockQuestionUri),
  selectSparql: mockSelectSparql,
  updateSparql: mockUpdateSparql,
}));

mock.module("../../qanary-component-relation-detection/src/relation-types.ts", () => ({
  KNOWN_RELATION_TYPES: [
    "UNKNOWN",
    "AMOUNT_WATERED_DISTRICT",
    "AMOUNT_SPONSORED_TREES",
    "WATERABLE_TREES_AT_ADDRESS",
    "TREES_BY_SPECIES_DISTRICT",
    "WATERABLE_TREES_AT_KITA",
  ],
}));

// Import AFTER mocks are registered.
const { handler } = await import("../handler.ts");

describe("#Sparql Generation Component", () => {
  beforeEach(() => {
    mockQuestionUri = "urn:qanary:question:123";
    mockRelation = null;
    mockDataResults = [];
    mockUpdateSparql.mockClear();
    mockSelectSparql.mockClear();
  });

  test("does nothing if no question uri found", async () => {
    mockQuestionUri = null;
    await handler({});
    expect(mockSelectSparql).not.toHaveBeenCalled();
    expect(mockUpdateSparql).not.toHaveBeenCalled();
  });

  test("does nothing if no relation found", async () => {
    mockRelation = null;
    await handler({});
    // Should have called select once for relation, then stopped
    expect(mockSelectSparql).toHaveBeenCalledTimes(1);
    expect(mockUpdateSparql).not.toHaveBeenCalled();
  });

  test("executes query and saves AnnotationOfAnswerJson for valid relation", async () => {
    mockRelation = "AMOUNT_WATERED_DISTRICT";
    mockDataResults = [{ amount: { type: "literal", value: "12.5" } }, { amount: { type: "literal", value: "7.5" } }];

    await handler({});

    // 1 call for relation, 1 call for data
    expect(mockSelectSparql).toHaveBeenCalledTimes(2);
    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);

    const query = String(mockUpdateSparql.mock.calls[0]?.at(1) ?? "");
    expect(query).toContain("a <urn:qanary#AnnotationOfAnswerJson>");
    expect(query).toContain("oa:hasBody");
    expect(query).toContain('vars":["amount"]');
    expect(query).toContain('"value":"12.5"');
    expect(query).toContain("oa:annotatedBy <urn:leipzigtreechat:component:query_builder>");
  });
});
