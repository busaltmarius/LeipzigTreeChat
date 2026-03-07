import { beforeEach, describe, expect, mock, test } from "bun:test";
import { QANARY_PREFIX } from "@leipzigtreechat/shared";

// ---------------------------------------------------------------------------
// Mock the "ai" module so generateObject never calls a real LLM.
// ---------------------------------------------------------------------------

type NerdEntityResult = {
  entity: string;
  type: string;
  start: number;
  end: number;
  confidence: number;
};

let mockGenerateObjectResult: { entities: NerdEntityResult[] } = {
  entities: [],
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
const { detectAndRecogniseEntities, KNOWN_ENTITY_TYPES } = await import("../nerd-classifier.ts");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A fake LanguageModel — only the identity matters, not the shape. */
const mockModel = { modelId: "mock-model" } as any;

/**
 * Model factory injected into detectAndRecogniseEntities so no real LLM
 * or OPENROUTER_API_KEY is needed.
 */
const modelFactory = mock(() => mockModel);

const setEntities = (entities: NerdEntityResult[]) => {
  mockGenerateObjectResult = { entities };
  mockGenerateObjectError = null;
};

const setError = (err: Error) => {
  mockGenerateObjectError = err;
};

// Builds a well-formed entity where start/end are derived from the question.
const makeEntity = (question: string, entity: string, type: string, confidence = 1): NerdEntityResult => {
  const start = question.indexOf(entity);
  if (start === -1) {
    throw new Error(`Entity "${entity}" not found in question "${question}"`);
  }
  return { entity, type, start, end: start + entity.length, confidence };
};

// ---------------------------------------------------------------------------
// detectAndRecogniseEntities
// ---------------------------------------------------------------------------

describe("detectAndRecogniseEntities", () => {
  beforeEach(() => {
    setEntities([]);
    mockGenerateObject.mockClear();
    modelFactory.mockClear();
  });

  // --- empty result --------------------------------------------------------

  test("returns an empty entities array when the LLM finds nothing", async () => {
    setEntities([]);
    const result = await detectAndRecogniseEntities("Erkläre mir die Photosynthese.", modelFactory);
    expect(result).not.toBeNull();
    expect(result!.entities).toHaveLength(0);
  });

  // --- single entity -------------------------------------------------------

  test("returns a single DISTRICT entity", async () => {
    const question = "Wie viel wurde im Stadtteil Connewitz gegossen?";
    setEntities([makeEntity(question, "Connewitz", "DISTRICT", 0.97)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities).toHaveLength(1);
    const e = result!.entities[0]!;
    expect(e.entity).toBe("Connewitz");
    expect(e.type).toBe("DISTRICT");
    expect(e.confidence).toBe(0.97);
  });

  test("returns a single CITY entity", async () => {
    const question = "Wie viele Bäume gibt es in Leipzig?";
    setEntities([makeEntity(question, "Leipzig", "CITY", 0.99)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities).toHaveLength(1);
    expect(result!.entities[0]!.type).toBe("CITY");
    expect(result!.entities[0]!.entity).toBe("Leipzig");
  });

  test("returns a single STREET entity", async () => {
    const question = "Gibt es Bäume in der Karl-Liebknecht-Straße?";
    setEntities([makeEntity(question, "Karl-Liebknecht-Straße", "STREET", 0.95)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities[0]!.type).toBe("STREET");
    expect(result!.entities[0]!.entity).toBe("Karl-Liebknecht-Straße");
  });

  test("returns a single ZIP entity", async () => {
    const question = "Was steht in 04277?";
    setEntities([makeEntity(question, "04277", "ZIP", 0.98)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities[0]!.type).toBe("ZIP");
    expect(result!.entities[0]!.entity).toBe("04277");
  });

  test("returns a single YEAR entity", async () => {
    const question = "Welche Bäume wurden 2021 gepflanzt?";
    setEntities([makeEntity(question, "2021", "YEAR", 0.99)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities[0]!.type).toBe("YEAR");
    expect(result!.entities[0]!.entity).toBe("2021");
  });

  test("returns a single TREE entity", async () => {
    const question = "Wie alt ist die alte Eiche im Rosental?";
    setEntities([makeEntity(question, "alte Eiche", "TREE", 0.88)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities[0]!.type).toBe("TREE");
    expect(result!.entities[0]!.entity).toBe("alte Eiche");
  });

  test("returns a single SPECIES entity", async () => {
    const question = "Wie viele Linden gibt es in Connewitz?";
    setEntities([makeEntity(question, "Linden", "SPECIES", 0.93), makeEntity(question, "Connewitz", "DISTRICT", 0.97)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    const species = result!.entities.find((e) => e.type === "SPECIES");
    expect(species?.entity).toBe("Linden");
  });

  test("returns a single KITA entity", async () => {
    const question = "Welche Bäume stehen neben der Kita Sonnenschein?";
    setEntities([makeEntity(question, "Kita Sonnenschein", "KITA", 0.91)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities[0]!.type).toBe("KITA");
  });

  test("returns a single PARK entity", async () => {
    const question = "Wie viele Bäume gibt es im Clara-Zetkin-Park?";
    setEntities([makeEntity(question, "Clara-Zetkin-Park", "PARK", 0.96)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities[0]!.type).toBe("PARK");
  });

  test("returns a DATE entity for relative date expressions", async () => {
    const question = "Wann wurde der Baum heute zuletzt gegossen?";
    setEntities([makeEntity(question, "heute", "DATE", 0.9)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities[0]!.type).toBe("DATE");
  });

  // --- multiple entities ---------------------------------------------------

  test("returns multiple entities from a complex question", async () => {
    const question = "Welche Wasserentnahmestellen gibt es in der Nähe der Karl-Liebknecht-Str. 132, 04277 Leipzig?";
    setEntities([
      makeEntity(question, "Karl-Liebknecht-Str.", "STREET", 0.95),
      makeEntity(question, "132", "STREET_NUMBER", 0.9),
      makeEntity(question, "04277", "ZIP", 0.98),
      makeEntity(question, "Leipzig", "CITY", 0.99),
    ]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities).toHaveLength(4);

    const types = result!.entities.map((e) => e.type);
    expect(types).toContain("STREET");
    expect(types).toContain("STREET_NUMBER");
    expect(types).toContain("ZIP");
    expect(types).toContain("CITY");
  });

  test("all returned entities have correct start/end offsets", async () => {
    const question = "Gibt es Bäume in Gohlis und Connewitz?";
    setEntities([
      makeEntity(question, "Gohlis", "DISTRICT", 0.95),
      makeEntity(question, "Connewitz", "DISTRICT", 0.95),
    ]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    for (const entity of result!.entities) {
      expect(question.slice(entity.start, entity.end)).toBe(entity.entity);
    }
  });

  test("confidence values are in [0, 1] for all entities", async () => {
    const question = "Welche Bäume stehen in Reudnitz und Gohlis?";
    setEntities([makeEntity(question, "Reudnitz", "DISTRICT", 0.92), makeEntity(question, "Gohlis", "DISTRICT", 0.88)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    for (const entity of result!.entities) {
      expect(entity.confidence).toBeGreaterThanOrEqual(0);
      expect(entity.confidence).toBeLessThanOrEqual(1);
    }
  });

  // --- offset sanitisation -------------------------------------------------

  test("drops entities whose span does not match the question text", async () => {
    const question = "Wie viele Bäume gibt es in Connewitz?";
    // Deliberately wrong: entity text doesn't match question.slice(start, end)
    mockGenerateObjectResult = {
      entities: [
        {
          entity: "Gohlis", // wrong text — not at these offsets
          type: "DISTRICT",
          start: 27,
          end: 36,
          confidence: 0.9,
        },
      ],
    };
    mockGenerateObjectError = null;
    const result = await detectAndRecogniseEntities(question, modelFactory);
    // The entity must have been dropped by the sanitiser
    expect(result!.entities).toHaveLength(0);
  });

  test("keeps entities with correct offsets and drops only the bad ones", async () => {
    const question = "Bäume in Leipzig und Connewitz?";
    mockGenerateObjectResult = {
      entities: [
        // good
        {
          entity: "Leipzig",
          type: "CITY",
          start: question.indexOf("Leipzig"),
          end: question.indexOf("Leipzig") + "Leipzig".length,
          confidence: 0.99,
        },
        // bad — wrong entity text for those offsets
        {
          entity: "FALSCH",
          type: "DISTRICT",
          start: question.indexOf("Connewitz"),
          end: question.indexOf("Connewitz") + "Connewitz".length,
          confidence: 0.85,
        },
      ],
    };
    mockGenerateObjectError = null;
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities).toHaveLength(1);
    expect(result!.entities[0]!.entity).toBe("Leipzig");
  });

  test("accepts entities whose offsets perfectly match their text", async () => {
    const question = "Welche Bäume stehen in Anger-Crottendorf?";
    setEntities([makeEntity(question, "Anger-Crottendorf", "DISTRICT", 0.94)]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    expect(result!.entities).toHaveLength(1);
    expect(result!.entities[0]!.entity).toBe("Anger-Crottendorf");
  });

  // --- open / custom entity types ------------------------------------------

  test("accepts custom entity types not in KNOWN_ENTITY_TYPES", async () => {
    const question = "Wann hat das Stadtamt Leipzig geöffnet?";
    setEntities([
      {
        entity: "Stadtamt",
        type: "GOVERNMENT_OFFICE",
        start: question.indexOf("Stadtamt"),
        end: question.indexOf("Stadtamt") + "Stadtamt".length,
        confidence: 0.8,
      },
      makeEntity(question, "Leipzig", "CITY", 0.99),
    ]);
    const result = await detectAndRecogniseEntities(question, modelFactory);
    const custom = result!.entities.find((e) => e.type === "GOVERNMENT_OFFICE");
    expect(custom).toBeDefined();
    expect(custom!.entity).toBe("Stadtamt");
  });

  // --- LLM call mechanics --------------------------------------------------

  test("calls generateObject exactly once per invocation", async () => {
    await detectAndRecogniseEntities("Wie viele Bäume?", modelFactory);
    expect(mockGenerateObject).toHaveBeenCalledTimes(1);
  });

  test("passes the question inside the prompt string", async () => {
    const question = "Welche Bäume stehen in Connewitz?";
    await detectAndRecogniseEntities(question, modelFactory);
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as any;
    expect(callArg.prompt).toContain(question);
  });

  test("passes a non-empty system prompt to generateObject", async () => {
    await detectAndRecogniseEntities("Wie viele Linden gibt es?", modelFactory);
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as any;
    expect(typeof callArg.system).toBe("string");
    expect(callArg.system.length).toBeGreaterThan(0);
  });

  test("passes the model returned by the model factory to generateObject", async () => {
    await detectAndRecogniseEntities("Wo ist der nächste Baum?", modelFactory);
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as any;
    expect(callArg.model).toBe(mockModel);
  });

  test("invokes the model factory exactly once per call", async () => {
    await detectAndRecogniseEntities("Wie alt ist diese Linde?", modelFactory);
    expect(modelFactory).toHaveBeenCalledTimes(1);
  });

  test("uses a different model when a custom factory is provided", async () => {
    const otherModel = { modelId: "other-model" } as any;
    const otherFactory = mock(() => otherModel);
    await detectAndRecogniseEntities("Wie viele Bäume gibt es?", otherFactory);
    const callArg = mockGenerateObject.mock.calls[0]?.[0] as any;
    expect(callArg.model).toBe(otherModel);
  });

  // --- default factory (getLlmModel) works when env var is set -------------

  test("uses the default factory when none is provided and OPENROUTER_API_KEY is set", async () => {
    const original = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = "test-key";
    try {
      const result = await detectAndRecogniseEntities("Wie viele Bäume?");
      // generateObject is mocked, so this should succeed
      expect(result).not.toBeNull();
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
    setError(new Error("Network error"));
    const result = await detectAndRecogniseEntities("Wie viele Bäume gibt es in Leipzig?", modelFactory);
    expect(result).toBeNull();
  });

  test("does not propagate errors thrown by generateObject", async () => {
    setError(new Error("Upstream failure"));
    await expect(detectAndRecogniseEntities("Welche Arten gibt es?", modelFactory)).resolves.toBeNull();
  });

  test("recovers correctly after a failed call", async () => {
    setError(new Error("Transient error"));
    const failed = await detectAndRecogniseEntities("Fehlerhafte Anfrage", modelFactory);
    expect(failed).toBeNull();

    // Next call should succeed
    const question = "Bäume in Gohlis?";
    setEntities([makeEntity(question, "Gohlis", "DISTRICT", 0.9)]);
    const recovered = await detectAndRecogniseEntities(question, modelFactory);
    expect(recovered!.entities).toHaveLength(1);
  });

  test("returns null and does not throw when the model factory throws", async () => {
    const throwingFactory = () => {
      throw new Error("Missing OPENROUTER_API_KEY");
    };
    const result = await detectAndRecogniseEntities("Wie viele Bäume gibt es?", throwingFactory);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// KNOWN_ENTITY_TYPES constant
// ---------------------------------------------------------------------------

describe("KNOWN_ENTITY_TYPES", () => {
  test("contains all required predefined types", () => {
    const required = ["TREE", "KITA", "DISTRICT", "ZIP", "CITY", "YEAR", "STREET"];
    for (const type of required) {
      expect(KNOWN_ENTITY_TYPES).toContain(type);
    }
  });

  test("has no duplicate entries", () => {
    const unique = new Set(KNOWN_ENTITY_TYPES);
    expect(unique.size).toBe(KNOWN_ENTITY_TYPES.length);
  });

  test("all entries are SCREAMING_SNAKE_CASE", () => {
    for (const type of KNOWN_ENTITY_TYPES) {
      expect(type).toMatch(/^[A-Z][A-Z0-9_]*$/);
    }
  });
});
