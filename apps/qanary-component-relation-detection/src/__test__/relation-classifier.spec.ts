import { beforeEach, describe, expect, mock, test } from "bun:test";

type RelationResult = {
  relationType: string;
  confidence: number;
};

let mockGenerateObjectResult: RelationResult = {
  relationType: "UNKNOWN",
  confidence: 0,
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
const { classifyRelationType } = await import("../relation-classifier.ts");

/** A fake LanguageModel */
const mockModel = { modelId: "mock-model" } as any;

/** Model factory override */
const modelFactory = mock(() => mockModel);

const setRelation = (res: RelationResult) => {
  mockGenerateObjectResult = res;
  mockGenerateObjectError = null;
};

const setError = (err: Error) => {
  mockGenerateObjectError = err;
};

describe("classifyRelationType", () => {
  beforeEach(() => {
    setRelation({ relationType: "UNKNOWN", confidence: 0 });
    mockGenerateObject.mockClear();
    modelFactory.mockClear();
  });

  test("returns AMOUNT_WATERED_DISTRICT for a watering question", async () => {
    setRelation({ relationType: "AMOUNT_WATERED_DISTRICT", confidence: 0.98 });
    const result = await classifyRelationType("Wie viel wurde gegossen?", modelFactory);
    expect(result!.relationType).toBe("AMOUNT_WATERED_DISTRICT");
    expect(result!.confidence).toBe(0.98);
  });

  test("returns WATER_INTAKE_ADDRESS for an intake question", async () => {
    setRelation({ relationType: "WATER_INTAKE_ADDRESS", confidence: 0.95 });
    const result = await classifyRelationType("Wo sind die Entnahmestellen?", modelFactory);
    expect(result!.relationType).toBe("WATER_INTAKE_ADDRESS");
  });

  test("returns null if LLM call fails", async () => {
    setError(new Error("LLM Error"));
    const result = await classifyRelationType("Question?", modelFactory);
    expect(result).toBeNull();
  });
});
