import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mock the nerd-classifier module so the handler never calls a real LLM.
// ---------------------------------------------------------------------------

let mockDetectResult: {
  entities: Array<{
    entity: string;
    type: string;
    start: number;
    end: number;
    confidence: number;
  }>;
} | null = null;

mock.module("../nerd-classifier.ts", () => ({
  detectAndRecogniseEntities: mock(async () => mockDetectResult),
}));

// ---------------------------------------------------------------------------
// Mock shared helpers: getQuestion and createAnnotationInKnowledgeGraph.
// ---------------------------------------------------------------------------

let mockQuestion: string | null = null;

mock.module("@leipzigtreechat/shared", () => ({
  getQuestion: mock(async () => mockQuestion),
  QANARY_PREFIX: "urn:qanary#",
}));

const mockCreateAnnotation = mock(async () => {});

mock.module("@leipzigtreechat/qanary-component-helpers", () => ({
  createAnnotationInKnowledgeGraph: mockCreateAnnotation,
}));

// Import AFTER all mocks are registered.
const { handler } = await import("../handler.ts");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Entity = {
  entity: string;
  type: string;
  start: number;
  end: number;
  confidence: number;
};

const makeEntity = (question: string, entity: string, type: string, confidence = 1): Entity => {
  const start = question.indexOf(entity);
  if (start === -1) throw new Error(`"${entity}" not found in question`);
  return { entity, type, start, end: start + entity.length, confidence };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("#Component handler", () => {
  beforeEach(() => {
    mockQuestion = null;
    mockDetectResult = null;
    mockCreateAnnotation.mockClear();
  });

  // --- no question ---------------------------------------------------------

  test("returns the original message unchanged when no question is present", async () => {
    mockQuestion = null;
    const message = { graphId: "test-1" };
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });

  test("does not write to the knowledge graph when no question is found", async () => {
    mockQuestion = null;
    await handler({});
    expect(mockCreateAnnotation).not.toHaveBeenCalled();
  });

  // --- LLM returns null ----------------------------------------------------

  test("returns the original message unchanged when the LLM returns null", async () => {
    mockQuestion = "Was ist Photosynthese?";
    mockDetectResult = null;
    const message = { graphId: "test-2" };
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });

  test("does not write to the knowledge graph when the LLM returns null", async () => {
    mockQuestion = "Was ist Photosynthese?";
    mockDetectResult = null;
    await handler({});
    expect(mockCreateAnnotation).not.toHaveBeenCalled();
  });

  // --- zero entities -------------------------------------------------------

  test("returns the original message when the LLM returns an empty entity list", async () => {
    mockQuestion = "Erkläre mir die Photosynthese bitte.";
    mockDetectResult = { entities: [] };
    const message = { graphId: "test-3" };
    const result = await handler(message);
    expect(result).toStrictEqual(message);
  });

  test("does not write to the knowledge graph when the entity list is empty", async () => {
    mockQuestion = "Erkläre mir die Photosynthese bitte.";
    mockDetectResult = { entities: [] };
    await handler({});
    expect(mockCreateAnnotation).not.toHaveBeenCalled();
  });

  // --- single entity -------------------------------------------------------

  test("writes exactly one annotation for a single detected entity", async () => {
    const question = "Wie viel wurde im Stadtteil Connewitz gegossen?";
    mockQuestion = question;
    mockDetectResult = { entities: [makeEntity(question, "Connewitz", "DISTRICT", 0.97)] };

    await handler({});

    expect(mockCreateAnnotation).toHaveBeenCalledTimes(1);
  });

  test("annotation value is JSON with entity and type fields", async () => {
    const question = "Wie viele Bäume gibt es in Leipzig?";
    mockQuestion = question;
    mockDetectResult = { entities: [makeEntity(question, "Leipzig", "CITY", 0.99)] };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    const value = JSON.parse(callArg.annotation.value);
    expect(value.entity).toBe("Leipzig");
    expect(value.type).toBe("CITY");
  });

  test("annotation range matches entity start and end offsets", async () => {
    const question = "Wie viele Bäume gibt es in Leipzig?";
    mockQuestion = question;
    const entity = makeEntity(question, "Leipzig", "CITY", 0.99);
    mockDetectResult = { entities: [entity] };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.annotation.range.start).toBe(entity.start);
    expect(callArg.annotation.range.end).toBe(entity.end);
  });

  test("annotation confidence matches the entity confidence", async () => {
    const question = "Wie viele Bäume gibt es in Gohlis?";
    mockQuestion = question;
    mockDetectResult = { entities: [makeEntity(question, "Gohlis", "DISTRICT", 0.88)] };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.annotation.confidence).toBe(0.88);
  });

  test("uses the correct Qanary annotation type", async () => {
    const question = "Welche Bäume stehen in Reudnitz?";
    mockQuestion = question;
    mockDetectResult = { entities: [makeEntity(question, "Reudnitz", "DISTRICT", 0.95)] };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.annotationType).toBe("urn:qanary#AnnotationOfNerd");
  });

  test("uses the correct component name", async () => {
    const question = "Welche Bäume stehen in Anger-Crottendorf?";
    mockQuestion = question;
    mockDetectResult = {
      entities: [makeEntity(question, "Anger-Crottendorf", "DISTRICT", 0.93)],
    };

    await handler({});

    const callArg = mockCreateAnnotation.mock.calls[0]?.[0] as any;
    expect(callArg.componentName).toBe("qanary-component-nerd-simple");
  });

  // --- multiple entities ---------------------------------------------------

  test("writes one annotation per entity for multiple detected entities", async () => {
    const question = "Welche Wasserentnahmestellen gibt es in der Nähe der Karl-Liebknecht-Str. 132, 04277 Leipzig?";
    mockQuestion = question;
    mockDetectResult = {
      entities: [
        makeEntity(question, "Karl-Liebknecht-Str.", "STREET", 0.95),
        makeEntity(question, "132", "STREET_NUMBER", 0.9),
        makeEntity(question, "04277", "ZIP", 0.98),
        makeEntity(question, "Leipzig", "CITY", 0.99),
      ],
    };

    await handler({});

    expect(mockCreateAnnotation).toHaveBeenCalledTimes(4);
  });

  test("each annotation has the correct entity text in its value", async () => {
    const question = "Bäume in Gohlis und Connewitz?";
    mockQuestion = question;
    mockDetectResult = {
      entities: [makeEntity(question, "Gohlis", "DISTRICT", 0.92), makeEntity(question, "Connewitz", "DISTRICT", 0.95)],
    };

    await handler({});

    const annotatedEntities = mockCreateAnnotation.mock.calls.map(
      (call) => JSON.parse((call[0] as any).annotation.value).entity
    );
    expect(annotatedEntities).toContain("Gohlis");
    expect(annotatedEntities).toContain("Connewitz");
  });

  test("each annotation has the correct entity type in its value", async () => {
    const question = "Bäume in Gohlis und Connewitz?";
    mockQuestion = question;
    mockDetectResult = {
      entities: [makeEntity(question, "Gohlis", "DISTRICT", 0.92), makeEntity(question, "Connewitz", "DISTRICT", 0.95)],
    };

    await handler({});

    const annotatedTypes = mockCreateAnnotation.mock.calls.map(
      (call) => JSON.parse((call[0] as any).annotation.value).type
    );
    expect(annotatedTypes).toEqual(["DISTRICT", "DISTRICT"]);
  });

  test("annotations for multiple entities have independent confidence values", async () => {
    const question = "Gibt es Bäume in Reudnitz (04318)?";
    mockQuestion = question;
    mockDetectResult = {
      entities: [makeEntity(question, "Reudnitz", "DISTRICT", 0.91), makeEntity(question, "04318", "ZIP", 0.99)],
    };

    await handler({});

    const confidences = mockCreateAnnotation.mock.calls.map((call) => (call[0] as any).annotation.confidence);
    expect(confidences).toContain(0.91);
    expect(confidences).toContain(0.99);
  });

  // --- return value --------------------------------------------------------

  test("returns the original message on success", async () => {
    const question = "Wo ist der nächste Baum?";
    mockQuestion = question;
    mockDetectResult = { entities: [makeEntity(question, "Baum", "TREE", 0.8)] };

    const message = { graphId: "test-success" };
    const result = await handler(message);

    expect(result).toStrictEqual(message);
  });

  test("handler does not fail with an empty message object", async () => {
    const result = await handler({});
    expect(result).toStrictEqual({});
  });

  // --- custom entity types -------------------------------------------------

  test("correctly annotates a custom (non-predefined) entity type", async () => {
    const question = "Wann hat das Stadtamt Leipzig geöffnet?";
    mockQuestion = question;
    mockDetectResult = {
      entities: [
        {
          entity: "Stadtamt",
          type: "GOVERNMENT_OFFICE",
          start: question.indexOf("Stadtamt"),
          end: question.indexOf("Stadtamt") + "Stadtamt".length,
          confidence: 0.8,
        },
        makeEntity(question, "Leipzig", "CITY", 0.99),
      ],
    };

    await handler({});

    expect(mockCreateAnnotation).toHaveBeenCalledTimes(2);
    const types = mockCreateAnnotation.mock.calls.map((call) => JSON.parse((call[0] as any).annotation.value).type);
    expect(types).toContain("GOVERNMENT_OFFICE");
    expect(types).toContain("CITY");
  });
});
