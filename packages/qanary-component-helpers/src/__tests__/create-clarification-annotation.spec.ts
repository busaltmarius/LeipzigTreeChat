import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { IQanaryMessage } from "../api.js";

import { createClarificationAnnotation, escapeSparqlTripleQuoted } from "../create-clarification-annotation.js";

import { updateSparql } from "../query-sparql.js";

beforeEach(() => {
  mock.module("../query-sparql.js", () => ({
    updateSparql: mock(() => Promise.resolve()),
    selectSparql: mock(() => Promise.resolve([{ questionUrl: { value: "qanary-question-uri" } }])),
  }));

  mock.module("../get-question-uri.js", () => ({
    getQuestionUri: mock(() => Promise.resolve("qanary-question-uri")),
  }));
});

afterEach(() => {
  mock.restore();
  mock.clearAllMocks();
});

describe("escapeSparqlTripleQuoted", () => {
  test("returns the same string when no escaping is needed", () => {
    expect(escapeSparqlTripleQuoted("Hello world")).toBe("Hello world");
  });

  test("escapes triple double-quotes", () => {
    const input = 'text with """ inside';
    const result = escapeSparqlTripleQuoted(input);
    expect(result).not.toContain('"""');
    expect(result).toBe('text with \\"\\"\\" inside');
  });

  test("escapes backslashes before escaping quotes", () => {
    const input = "back\\slash";
    expect(escapeSparqlTripleQuoted(input)).toBe("back\\\\slash");
  });

  test("handles string with both backslashes and triple quotes", () => {
    const input = '\\"""';
    const result = escapeSparqlTripleQuoted(input);
    expect(result).toBe('\\\\\\"\\"\\"');
  });

  test("leaves single and double quotes untouched", () => {
    expect(escapeSparqlTripleQuoted('a "b" c')).toBe('a "b" c');
    expect(escapeSparqlTripleQuoted("a 'b' c")).toBe("a 'b' c");
    expect(escapeSparqlTripleQuoted('a "" c')).toBe('a "" c');
  });

  test("handles empty string", () => {
    expect(escapeSparqlTripleQuoted("")).toBe("");
  });
});

describe("createClarificationAnnotation", () => {
  const qanaryMessage: IQanaryMessage = {
    endpoint: "http://qanary-pipeline:40111/sparql",
    inGraph: "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd",
    outGraph: "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd",
  };

  test("writes an AnnotationOfClarification with correct SPARQL INSERT", async () => {
    const mockUpdateSparql = mock();
    // @ts-expect-error - mocking module
    updateSparql.mockImplementation(mockUpdateSparql);

    await createClarificationAnnotation({
      message: qanaryMessage,
      componentName: "qanary-component-test",
      clarificationQuestion: "Did you mean tree species or tree location?",
    });

    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);

    const [endpointArg, queryArg] = mockUpdateSparql.mock.calls[0]!;
    expect(endpointArg).toBe(qanaryMessage.endpoint);

    // Verify the SPARQL query structure
    expect(queryArg).toContain("INSERT {");
    expect(queryArg).toContain(`GRAPH <${qanaryMessage.outGraph}>`);
    expect(queryArg).toContain("a <urn:qanary#AnnotationOfClarification>");
    expect(queryArg).toContain('oa:hasBody """Did you mean tree species or tree location?"""');
    expect(queryArg).toContain("oa:hasTarget <qanary-question-uri>");
    expect(queryArg).toContain("oa:annotatedBy <urn:qanary-component-test>");
    expect(queryArg).toContain("oa:annotatedAt ?time");
    expect(queryArg).toContain('BIND (IRI(CONCAT("urn:qanary:annotation:clarification-", STRUUID())) AS ?annotation)');
    expect(queryArg).toContain("BIND (NOW() AS ?time)");
  });

  test("escapes triple quotes in the clarification text", async () => {
    const mockUpdateSparql = mock();
    // @ts-expect-error - mocking module
    updateSparql.mockImplementation(mockUpdateSparql);

    await createClarificationAnnotation({
      message: qanaryMessage,
      componentName: "test-component",
      clarificationQuestion: 'Question with """ triple quotes',
    });

    expect(mockUpdateSparql).toHaveBeenCalledTimes(1);
    const queryArg = mockUpdateSparql.mock.calls[0]![1] as string;

    // The raw triple-quotes must not appear unescaped in the body
    // (the surrounding delimiters don't count)
    const bodyMatch = queryArg.match(/oa:hasBody """([\s\S]*?)"""/);
    expect(bodyMatch).toBeTruthy();
    expect(bodyMatch![1]).not.toContain('"""');
  });

  test("only logs an error if updateSparql throws", async () => {
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
    // @ts-expect-error - mocking module
    updateSparql.mockImplementation(() => Promise.reject(new Error("SPARQL failure")));

    await createClarificationAnnotation({
      message: qanaryMessage,
      componentName: "test-component",
      clarificationQuestion: "Some clarification",
    });

    // Should not throw
    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorMessages = consoleErrorSpy.mock.calls.map((c) => String(c[0]));
    expect(errorMessages.some((m) => m.includes("Error writing clarification annotation"))).toBe(true);
  });

  test("uses the outGraph from the message", async () => {
    const mockUpdateSparql = mock();
    // @ts-expect-error - mocking module
    updateSparql.mockImplementation(mockUpdateSparql);

    const customMessage: IQanaryMessage = {
      endpoint: "http://localhost:8890/sparql/",
      inGraph: "urn:graph:in-123",
      outGraph: "urn:graph:out-456",
    };

    await createClarificationAnnotation({
      message: customMessage,
      componentName: "comp",
      clarificationQuestion: "Which district?",
    });

    const queryArg = mockUpdateSparql.mock.calls[0]![1] as string;
    expect(queryArg).toContain("GRAPH <urn:graph:out-456>");
  });

  test("includes the component name in oa:annotatedBy", async () => {
    const mockUpdateSparql = mock();
    // @ts-expect-error - mocking module
    updateSparql.mockImplementation(mockUpdateSparql);

    await createClarificationAnnotation({
      message: qanaryMessage,
      componentName: "qanary-component-dis",
      clarificationQuestion: "Which tree?",
    });

    const queryArg = mockUpdateSparql.mock.calls[0]![1] as string;
    expect(queryArg).toContain("oa:annotatedBy <urn:qanary-component-dis>");
  });
});
