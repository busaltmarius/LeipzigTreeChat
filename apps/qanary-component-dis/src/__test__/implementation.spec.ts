import { describe, expect, mock, test } from "bun:test";
import { createAnnotationInKnowledgeGraph, getEndpoint, getInGraph, selectSparql } from "@leipzigtreechat/shared";
import { disambiguate, fetchNerAnnotations, writeDisambiguationAnnotation } from "../implementation";

mock.module("@leipzigtreechat/shared", () => ({
  selectSparql: mock(async () => []),
  getEndpoint: mock(() => "http://localhost:8890/sparql/"),
  getInGraph: mock(() => "urn:test:graph"),
  QANARY_PREFIX: "urn:qanary#",
  createAnnotationInKnowledgeGraph: mock(async () => {}),
}));

// Mock fetch for question text retrieval
global.fetch = mock(async (url: string) => {
  if (String(url).endsWith("/raw")) {
    return { text: async () => "Welchen Baum gibt es in Connewitz mit einer Gemeine Esche?" } as Response;
  }
  return {
    json: async () => ({ rawdata: `${url}/raw` }),
  } as Response;
}) as any;

describe("#fetchNerAnnotations", () => {
  test("fetches NER annotations for a question", async () => {
    const mockSelectSparql = mock(async () => [
      {
        annotation: { value: "urn:qanary:annotation:test-001" },
        target:     { value: "urn:qanary:target:test-001" },
        entityType: { value: "urn:leipzigtreechat:entityType:TREE" },
        score:      { value: "0.99" },
        start:      { value: "44" },
        end:        { value: "57" },
      },
    ]);

    mock.module("@leipzigtreechat/shared", () => ({
      selectSparql: mockSelectSparql,
      getEndpoint: mock(() => "http://localhost:8890/sparql/"),
      getInGraph: mock(() => "urn:test:graph"),
      QANARY_PREFIX: "urn:qanary#",
      createAnnotationInKnowledgeGraph: mock(async () => {}),
    }));

    const { fetchNerAnnotations: fn } = await import("../implementation");

    const annotations = await fn(
      { endpoint: "http://localhost:8890/sparql/", inGraph: "urn:test:graph", outGraph: "urn:test:graph" },
      "http://localhost:8080/question/stored-question__text_test"
    );

    expect(annotations).toHaveLength(1);
    expect(annotations[0]?.annotationUri).toBe("urn:qanary:annotation:test-001");
    expect(annotations[0]?.entityType).toBe("urn:leipzigtreechat:entityType:TREE");
    expect(annotations[0]?.score).toBe(0.99);
    expect(annotations[0]?.start).toBe(44);
    expect(annotations[0]?.end).toBe(57);
    expect(annotations[0]?.exactQuote).toBe("Gemeine Esche"); 
  });

  test("returns empty array when no annotations found", async () => {
    mock.module("@leipzigtreechat/shared", () => ({
      selectSparql: mock(async () => []),
      getEndpoint: mock(() => "http://localhost:8890/sparql/"),
      getInGraph: mock(() => "urn:test:graph"),
      QANARY_PREFIX: "urn:qanary#",
      createAnnotationInKnowledgeGraph: mock(async () => {}),
    }));

    const { fetchNerAnnotations: fn } = await import("../implementation");

    const annotations = await fn(
      { endpoint: "http://localhost:8890/sparql/", inGraph: "urn:test:graph", outGraph: "urn:test:graph" },
      "http://localhost:8080/question/stored-question__text_test"
    );

    expect(annotations).toHaveLength(0);
  });
});

describe("#disambiguate", () => {
  test("successfully disambiguates TREE entity", async () => {
    const mockSelectSparql = mock(async () => [
      {
        urn:  { value: "urn:de:leipzig:trees:resource:baumkataster:ga_Gemeine_Esche:Fraxinus_excelsior" },
        name: { value: "Gemeine Esche" },
      },
      {
        urn:  { value: "urn:de:leipzig:trees:resource:baumkataster:ga_Winter_Linde:Tilia_cordata" },
        name: { value: "Winter-Linde" },
      },
    ]);

    mock.module("@leipzigtreechat/shared", () => ({
      selectSparql: mockSelectSparql,
      QANARY_PREFIX: "urn:qanary#",
    }));

    const { disambiguate: fn } = await import("../implementation");

    const result = await fn({
      annotationUri:   "urn:qanary:annotation:test-001",
      spotResourceUri: "urn:qanary:target:test-001",
      exactQuote:      "Gemeine Esche",
      entityType:      "urn:leipzigtreechat:entityType:TREE",
      score:           0.99,
      start:           37,
      end:             50,
      questionUri:     "http://localhost:8080/question/stored-question__text_test",
    });

    expect(result).not.toBeNull();
    expect(result!.entityUrn).toBe("urn:de:leipzig:trees:resource:baumkataster:ga_Gemeine_Esche:Fraxinus_excelsior");
    expect(result!.label).toBe("Gemeine Esche");
    expect(result!.score).toBeGreaterThan(0);
  });

  test("successfully disambiguates DISTRICT entity", async () => {
    const mockSelectSparql = mock(async () => [
      {
        urn:  { value: "urn:de:leipzig:trees:resource:ortsteile:30" },
        name: { value: "Connewitz" },
      },
    ]);

    mock.module("@leipzigtreechat/shared", () => ({
      selectSparql: mockSelectSparql,
      QANARY_PREFIX: "urn:qanary#",
    }));

    const { disambiguate: fn } = await import("../implementation");

    const result = await fn({
      annotationUri:   "urn:qanary:annotation:test-002",
      spotResourceUri: "urn:qanary:target:test-002",
      exactQuote:      "Connewitz",
      entityType:      "urn:leipzigtreechat:entityType:DISTRICT",
      score:           0.99,
      start:           28,
      end:             37,
      questionUri:     "http://localhost:8080/question/stored-question__text_test",
    });

    expect(result).not.toBeNull();
    expect(result!.entityUrn).toBe("urn:de:leipzig:trees:resource:ortsteile:30");
    expect(result!.label).toBe("Connewitz");
  });

  test("handles unsupported entity type", async () => {
    const { disambiguate: fn } = await import("../implementation");

    const result = await fn({
      annotationUri:   "urn:qanary:annotation:test-003",
      spotResourceUri: "urn:qanary:target:test-003",
      exactQuote:      "Test",
      entityType:      "urn:leipzigtreechat:entityType:UNSUPPORTED",
      score:           0.95,
      start:           0,
      end:             4,
      questionUri:     "http://localhost:8080/question/stored-question__text_test",
    });

    expect(result).toBeNull();
  });

  test("returns null when no candidates found", async () => {
    mock.module("@leipzigtreechat/shared", () => ({
      selectSparql: mock(async () => []),
      QANARY_PREFIX: "urn:qanary#",
    }));

    const { disambiguate: fn } = await import("../implementation");

    const result = await fn({
      annotationUri:   "urn:qanary:annotation:test-004",
      spotResourceUri: "urn:qanary:target:test-004",
      exactQuote:      "Unbekannter Baum",
      entityType:      "urn:leipzigtreechat:entityType:TREE",
      score:           0.95,
      start:           0,
      end:             16,
      questionUri:     "http://localhost:8080/question/stored-question__text_test",
    });

    expect(result).toBeNull();
  });

  test("returns null when no candidates meet threshold", async () => {
    mock.module("@leipzigtreechat/shared", () => ({
      selectSparql: mock(async () => [
        {
          urn:  { value: "urn:de:leipzig:trees:resource:baumkataster:ga_Winter_Linde:Tilia_cordata" },
          name: { value: "Völlig anderer Name" },
        },
      ]),
      QANARY_PREFIX: "urn:qanary#",
    }));

    const { disambiguate: fn } = await import("../implementation");

    const result = await fn({
      annotationUri:   "urn:qanary:annotation:test-005",
      spotResourceUri: "urn:qanary:target:test-005",
      exactQuote:      "Gemeine Esche",
      entityType:      "urn:leipzigtreechat:entityType:TREE",
      score:           0.95,
      start:           0,
      end:             13,
      questionUri:     "http://localhost:8080/question/stored-question__text_test",
    });

    expect(result).toBeNull();
  });
});

describe("#writeDisambiguationAnnotation", () => {
  test("writes disambiguation annotation to triplestore", async () => {
    const mockCreateAnnotation = mock(async () => {});

    mock.module("@leipzigtreechat/shared", () => ({
      selectSparql: mock(async () => []),
      getEndpoint: mock(() => "http://localhost:8890/sparql/"),
      getInGraph: mock(() => "urn:test:graph"),
      QANARY_PREFIX: "urn:qanary#",
      createAnnotationInKnowledgeGraph: mockCreateAnnotation,
    }));

    const { writeDisambiguationAnnotation: fn } = await import("../implementation");

    await fn(
      { endpoint: "http://localhost:8890/sparql/", inGraph: "urn:test:graph", outGraph: "urn:test:graph" },
      {
        annotationUri:   "urn:qanary:annotation:test-001",
        spotResourceUri: "urn:qanary:target:test-001",
        exactQuote:      "Connewitz",
        entityType:      "urn:leipzigtreechat:entityType:DISTRICT",
        score:           0.99,
        start:           28,
        end:             37,
        questionUri:     "http://localhost:8080/question/stored-question__text_test",
      },
      {
        entityUrn: "urn:de:leipzig:trees:resource:ortsteile:30",
        score:     0.99,
        label:     "Connewitz",
      }
    );

    expect(mockCreateAnnotation).toHaveBeenCalled();
  });
});

describe("Multi-entity support", () => {
  test("extracts entity type from URI", async () => {
    const { extractEntityTypeFromUri } = await import("../entity-types");

    expect(extractEntityTypeFromUri("urn:leipzigtreechat:entityType:TREE")).toBe("TREE");
    expect(extractEntityTypeFromUri("urn:leipzigtreechat:entityType:KITA")).toBe("KITA");
    expect(extractEntityTypeFromUri("urn:leipzigtreechat:entityType:DISTRICT")).toBe("DISTRICT");
    expect(extractEntityTypeFromUri("urn:leipzigtreechat:entityType:INVALID")).toBeNull();
    expect(extractEntityTypeFromUri("invalid:uri")).toBeNull();
  });

  test("generates entity-specific queries", async () => {
    const { generateEntityQuery } = await import("../entity-types");

    const treeQuery = generateEntityQuery("TREE");
    expect(treeQuery).toContain("SELECT ?urn ?name");
    expect(treeQuery).toContain("baumkataster:");
    expect(treeQuery).toContain("Species");

    const kitaQuery = generateEntityQuery("KITA");
    expect(kitaQuery).toContain("SELECT ?urn ?name");
    expect(kitaQuery).toContain("kitas:");
    expect(kitaQuery).toContain("Kita");

    const districtQuery = generateEntityQuery("DISTRICT");
    expect(districtQuery).toContain("SELECT ?urn ?name");
    expect(districtQuery).toContain("ortsteile:");
    expect(districtQuery).toContain("District");
  });
});