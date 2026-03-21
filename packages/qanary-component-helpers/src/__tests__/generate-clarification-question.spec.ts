import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { LanguageModel } from "ai";
import type { GenerateTextFn } from "../generate-clarification-question.js";

// ---------------------------------------------------------------------------
// We do NOT mock the "ai" module. Instead we inject a mock generateFn
// directly into generateClarificationQuestion's third parameter.
// ---------------------------------------------------------------------------

const { generateClarificationQuestion } = await import("../generate-clarification-question.js");

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

let mockGenerateTextResult: { text: string };
let mockGenerateTextError: Error | null;

const mockGenerateText: ReturnType<typeof mock<GenerateTextFn>> = mock(async () => {
  if (mockGenerateTextError) {
    throw mockGenerateTextError;
  }
  return mockGenerateTextResult;
});

const mockModel = { modelId: "mock-model" } as unknown as LanguageModel;
const modelFactory = mock(() => mockModel);

const baseContext = {
  question: "Welche Bäume stehen in Connewitz?",
  componentName: "test-component",
  ambiguityDescription: "Multiple districts matched the input.",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("generateClarificationQuestion", () => {
  beforeEach(() => {
    mockGenerateTextResult = { text: "Could you clarify what you mean?" };
    mockGenerateTextError = null;
    mockGenerateText.mockClear();
    modelFactory.mockClear();
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  test("returns the trimmed LLM response text", async () => {
    mockGenerateTextResult = { text: "  Meinten Sie den Stadtteil Connewitz oder die Straße Connewitz?  " };
    const result = await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    expect(result).toBe("Meinten Sie den Stadtteil Connewitz oder die Straße Connewitz?");
  });

  test("calls generateFn exactly once", async () => {
    await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    expect(mockGenerateText).toHaveBeenCalledTimes(1);
  });

  test("passes a system prompt to generateFn", async () => {
    await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    const calls = mockGenerateText.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const callArgs = calls[0]?.[0];
    expect(callArgs?.system).toBeDefined();
    expect(typeof callArgs?.system).toBe("string");
    expect((callArgs?.system as string).length).toBeGreaterThan(0);
  });

  test("includes the user question in the prompt", async () => {
    await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    const calls = mockGenerateText.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const callArgs = calls[0]?.[0];
    expect(callArgs?.prompt).toContain(baseContext.question);
  });

  test("includes the ambiguity description in the prompt", async () => {
    await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    const calls = mockGenerateText.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const callArgs = calls[0]?.[0];
    expect(callArgs?.prompt).toContain(baseContext.ambiguityDescription);
  });

  test("includes the component name in the prompt", async () => {
    await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    const calls = mockGenerateText.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const callArgs = calls[0]?.[0];
    expect(callArgs?.prompt).toContain(baseContext.componentName);
  });

  test("uses the injected model factory", async () => {
    await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    expect(modelFactory).toHaveBeenCalledTimes(1);
    const calls = mockGenerateText.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const callArgs = calls[0]?.[0];
    expect(callArgs?.model).toBe(mockModel);
  });

  // ── Empty / whitespace responses ────────────────────────────────────────

  test("returns null when the LLM returns an empty string", async () => {
    mockGenerateTextResult = { text: "" };
    const result = await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    expect(result).toBeNull();
  });

  test("returns null when the LLM returns only whitespace", async () => {
    mockGenerateTextResult = { text: "   \n  \t  " };
    const result = await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    expect(result).toBeNull();
  });

  // ── Error handling ──────────────────────────────────────────────────────

  test("returns null when the LLM call throws", async () => {
    mockGenerateTextError = new Error("LLM timeout");
    const result = await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    expect(result).toBeNull();
  });

  test("does not throw when the LLM call fails", async () => {
    mockGenerateTextError = new Error("network error");
    await expect(generateClarificationQuestion(baseContext, modelFactory, mockGenerateText)).resolves.toBeNull();
  });

  test("recovers on the next call after a failure", async () => {
    mockGenerateTextError = new Error("transient failure");
    const first = await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    expect(first).toBeNull();

    mockGenerateTextError = null;
    mockGenerateTextResult = { text: "Bitte klären Sie Ihre Frage." };
    const second = await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    expect(second).toBe("Bitte klären Sie Ihre Frage.");
  });

  // ── Different contexts ──────────────────────────────────────────────────

  test("works with disambiguation context", async () => {
    mockGenerateTextResult = { text: "Meinten Sie die Stieleiche oder die Traubeneiche?" };
    const ctx = {
      question: "Wo steht die Eiche?",
      componentName: "qanary-component-dis",
      ambiguityDescription: 'Could not resolve entity "Eiche" — multiple tree species match.',
    };
    const result = await generateClarificationQuestion(ctx, modelFactory, mockGenerateText);
    expect(result).toBe("Meinten Sie die Stieleiche oder die Traubeneiche?");
  });

  test("works with EAT context", async () => {
    mockGenerateTextResult = { text: "Erwarten Sie eine Zahl oder eine Liste als Antwort?" };
    const ctx = {
      question: "Bäume in Connewitz?",
      componentName: "qanary-component-eat-simple",
      ambiguityDescription: 'Low confidence for expected answer type "list" (0.35).',
    };
    const result = await generateClarificationQuestion(ctx, modelFactory, mockGenerateText);
    expect(result).toBe("Erwarten Sie eine Zahl oder eine Liste als Antwort?");
  });

  test("works with relation detection context", async () => {
    mockGenerateTextResult = { text: "Möchten Sie nach gegossenen Bäumen oder nach Baumarten suchen?" };
    const ctx = {
      question: "Was gibt es in Plagwitz?",
      componentName: "qanary-component-relation-detection",
      ambiguityDescription: "Relation type classified as UNKNOWN.",
    };
    const result = await generateClarificationQuestion(ctx, modelFactory, mockGenerateText);
    expect(result).toBe("Möchten Sie nach gegossenen Bäumen oder nach Baumarten suchen?");
  });

  // ── System prompt content ───────────────────────────────────────────────

  test("system prompt mentions Leipzig / urban trees", async () => {
    await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    const calls = mockGenerateText.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const system = calls[0]?.[0]?.system as string;
    expect(system).toContain("Leipzig");
  });

  test("system prompt instructs the LLM to respond in German", async () => {
    await generateClarificationQuestion(baseContext, modelFactory, mockGenerateText);
    const calls = mockGenerateText.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const system = calls[0]?.[0]?.system as string;
    expect(system).toContain("Deutsch");
  });
});
