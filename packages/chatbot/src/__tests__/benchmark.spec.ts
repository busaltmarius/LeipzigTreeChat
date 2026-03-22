import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Context, Data, Effect, Layer } from "effect";
import type { BenchmarkFixture } from "../__benchmarks__/types.js";

const mockHttpState = {
  shouldFail: false,
  body: {
    inGraph: "urn:test:graph",
  },
};

const llmState = {
  responseText: "In Connewitz wurden 120 Liter gegossen.",
  clarificationText: "In welchem Stadtteil oder an welcher Adresse suchst du einen Baum?",
  rewritePrefix: "rewritten:",
};

const triplestoreState = {
  finalAnswerContent: '{"district":"Connewitz","amount":"120 Liter","year":"2025"}',
  clarificationResponses: [] as Array<Array<{ uri: unknown; content: string }>>,
  clarificationCallCount: 0,
};

const MockHttpClientTag = Context.GenericTag<{ execute: (request: unknown) => Effect.Effect<unknown> }>(
  "MockHttpClient"
);
const MockLLMServiceTag = Context.GenericTag<{
  rewriteQuestion: (conversationHistory: string | undefined, input: string) => Effect.Effect<string, unknown>;
  generateChatbotResponse: (userInput: string, qanaryAnswer: unknown) => Effect.Effect<string, unknown>;
  generateClarificationQuestion: (userInput: string, question: unknown) => Effect.Effect<string, unknown>;
}>("MockLLMService");
const MockTriplestoreServiceTag = Context.GenericTag<{
  queryClarifications: (graphUri: string) => Effect.Effect<unknown[]>;
  queryFinalAnswer: (graphUri: string) => Effect.Effect<unknown, unknown>;
}>("MockTriplestoreService");

const createRequest = (url: string) => ({
  url,
  params: {} as Record<string, string | string[]>,
  pipe(...operations: Array<(value: unknown) => unknown>) {
    return operations.reduce((value, operation) => operation(value), this as unknown);
  },
});

mock.module("@effect/platform", () => ({
  HttpClient: {
    HttpClient: MockHttpClientTag,
  },
  HttpClientRequest: {
    post: (url: string) => createRequest(url),
    setUrlParams: (params: Record<string, string | string[]>) => (request: ReturnType<typeof createRequest>) => ({
      ...request,
      params,
    }),
  },
  HttpClientResponse: {
    filterStatusOk: (response: { status: number }) =>
      response.status >= 200 && response.status < 300 ? Effect.succeed(response) : Effect.fail(new Error("Not OK")),
    schemaBodyJson: (_schema: unknown) => (response: { body: unknown }) => Effect.succeed(response.body),
  },
}));

mock.module("../llm-service.js", () => ({
  LLMService: MockLLMServiceTag,
}));

class NotFoundError extends Data.TaggedError("NotFoundError")<{ itemType: string }> {
  constructor(itemType: string) {
    super({ itemType });
  }
}

class SPARQLError extends Data.TaggedError("SPARQLError")<{ reason: unknown }> {
  constructor(reason: unknown) {
    super({ reason });
  }
}

mock.module("../triplestore-service.js", () => ({
  NotFoundError,
  SPARQLError,
  TriplestoreService: MockTriplestoreServiceTag,
}));

mock.module("../langgraph-runtime.js", () => {
  const llmFailure = (operation: string) => (reason: unknown) => ({
    _tag: "LLMServiceError" as const,
    operation,
    reason,
  });

  const layer = Layer.mergeAll(
    Layer.succeed(MockHttpClientTag, {
      execute: ((_request: unknown) =>
        mockHttpState.shouldFail
          ? Effect.fail(new Error("HTTP request failed"))
          : Effect.succeed({
              status: 200,
              body: mockHttpState.body,
            })) as never,
    }),
    Layer.succeed(MockLLMServiceTag, {
      rewriteQuestion: (_conversationHistory: string | undefined, input: string) =>
        Effect.succeed(`${llmState.rewritePrefix}${input}`),
      generateChatbotResponse: (_userInput: string, _qanaryAnswer: unknown) =>
        Effect.tryPromise({
          try: async () => llmState.responseText,
          catch: llmFailure("generateChatbotResponse"),
        }),
      generateClarificationQuestion: (_userInput: string, _question: unknown) =>
        Effect.tryPromise({
          try: async () => llmState.clarificationText,
          catch: llmFailure("generateClarificationQuestion"),
        }),
    }),
    Layer.succeed(MockTriplestoreServiceTag, {
      queryClarifications: (_graphUri: string) =>
        Effect.succeed(triplestoreState.clarificationResponses[triplestoreState.clarificationCallCount++] ?? []),
      queryFinalAnswer: (_graphUri: string) =>
        Effect.succeed({
          _tag: "QanaryFinalAnswer" as const,
          uri: { value: "urn:test:answer" },
          content: triplestoreState.finalAnswerContent,
        }),
    })
  );

  return {
    runLangGraphRuntime: (effect: Effect.Effect<unknown, unknown, never>) =>
      Effect.runPromise(effect.pipe(Effect.provide(layer))),
  };
});

const { renderBenchmarkMarkdown } = await import("../__benchmarks__/report.js");
const { runBenchmarkCase, runBenchmarkSuite } = await import("../__benchmarks__/runner.js");
const { scoreBenchmarkCase } = await import("../__benchmarks__/scoring.js");

beforeEach(() => {
  mockHttpState.shouldFail = false;
  llmState.responseText = "In Connewitz wurden 120 Liter gegossen.";
  llmState.clarificationText = "In welchem Stadtteil oder an welcher Adresse suchst du einen Baum?";
  llmState.rewritePrefix = "rewritten:";
  triplestoreState.finalAnswerContent = '{"district":"Connewitz","amount":"120 Liter","year":"2025"}';
  triplestoreState.clarificationResponses = [];
  triplestoreState.clarificationCallCount = 0;
  process.env.QANARY_API_BASE_URL = "http://example.test/";
});

describe("benchmark scoring", () => {
  test("scores a fully matching case as pass", () => {
    const fixture: BenchmarkFixture = {
      id: "TEST_PASS",
      title: "Pass case",
      kind: "question",
      userTurns: ["Wie viel wurde gegossen?"],
      expectedFlow: {
        clarification: "forbidden" as const,
        requiredMetadataStatuses: ["WAITING_FOR_INPUT", "REWRITING_QUESTION"],
        minAssistantMessages: 1,
      },
      requiredSignals: [
        {
          label: "Contains Connewitz",
          value: "Connewitz",
          axis: "grounding" as const,
          critical: true,
          target: "assistant_last" as const,
        },
      ],
      forbiddenSignals: [],
      notes: "pass case",
    };
    const caseResult = {
      fixture,
      transcript: [
        {
          role: "assistant" as const,
          content: "Hallo",
          timestamp: new Date().toISOString(),
          turnIndex: null,
        },
        {
          role: "user" as const,
          content: "Wie viel wurde gegossen?",
          timestamp: new Date().toISOString(),
          turnIndex: 0,
        },
        {
          role: "assistant" as const,
          content: "In Connewitz wurden 120 Liter gegossen.",
          timestamp: new Date().toISOString(),
          turnIndex: 0,
        },
      ],
      metadata: [
        {
          status: "WAITING_FOR_INPUT" as const,
          message: "",
          timestamp: new Date().toISOString(),
        },
        {
          status: "REWRITING_QUESTION" as const,
          message: "",
          timestamp: new Date().toISOString(),
        },
      ],
      turnTimings: [],
      totalDurationMs: 10,
      evaluation: {
        status: "fail" as const,
        score: 0,
        axes: [],
      },
    };

    const evaluation = scoreBenchmarkCase(fixture, caseResult);

    expect(evaluation.status).toBe("pass");
    expect(evaluation.score).toBeGreaterThan(0.9);
  });

  test("marks missing non-critical signals as soft-fail", () => {
    const fixture: BenchmarkFixture = {
      id: "TEST_SOFT",
      title: "Soft-fail case",
      kind: "question",
      userTurns: ["Was kannst du?"],
      expectedFlow: {
        clarification: "forbidden" as const,
        requiredMetadataStatuses: ["WAITING_FOR_INPUT"],
        minAssistantMessages: 1,
      },
      requiredSignals: [
        {
          label: "Mentions Leipzig",
          value: "Leipzig",
          axis: "grounding" as const,
          critical: false,
          target: "assistant_last" as const,
        },
      ],
      forbiddenSignals: [],
      notes: "soft case",
    };
    const caseResult = {
      fixture,
      transcript: [
        {
          role: "assistant" as const,
          content: "Hallo",
          timestamp: new Date().toISOString(),
          turnIndex: null,
        },
        {
          role: "user" as const,
          content: "Was kannst du?",
          timestamp: new Date().toISOString(),
          turnIndex: 0,
        },
        {
          role: "assistant" as const,
          content: "Ich kann Fragen zu Bäumen beantworten.",
          timestamp: new Date().toISOString(),
          turnIndex: 0,
        },
      ],
      metadata: [
        {
          status: "WAITING_FOR_INPUT" as const,
          message: "",
          timestamp: new Date().toISOString(),
        },
      ],
      turnTimings: [],
      totalDurationMs: 10,
      evaluation: {
        status: "fail" as const,
        score: 0,
        axes: [],
      },
    };

    const evaluation = scoreBenchmarkCase(fixture, caseResult);

    expect(evaluation.status).toBe("soft-fail");
    expect(evaluation.failureReason).toContain("Mentions Leipzig");
  });
});

describe("benchmark runner", () => {
  test("captures a single-turn happy-path run", async () => {
    const fixture: BenchmarkFixture = {
      id: "RUNNER_Q",
      title: "Single-turn benchmark",
      kind: "question",
      userTurns: ["Wie viel wurde im Stadtteil Connewitz gegossen?"],
      expectedFlow: {
        clarification: "forbidden" as const,
        requiredMetadataStatuses: ["WAITING_FOR_INPUT", "REWRITING_QUESTION", "GATHERING_DATA"],
        minAssistantMessages: 1,
      },
      requiredSignals: [
        {
          label: "Contains Connewitz",
          value: "Connewitz",
          axis: "grounding" as const,
          critical: true,
          target: "assistant_last" as const,
        },
      ],
      forbiddenSignals: [],
      notes: "happy path",
    };

    const result = await runBenchmarkCase(fixture);

    expect(result.runtimeError).toBeUndefined();
    expect(result.transcript.some((entry) => entry.content.includes("120 Liter"))).toBeTrue();
    expect(result.metadata.map((entry) => entry.status)).toContain("GATHERING_DATA");
    expect(result.turnTimings[0]?.latencyMs).toBeNumber();
    expect(result.evaluation.status).toBe("pass");
  });

  test("captures a clarification path", async () => {
    triplestoreState.clarificationResponses = [
      [
        {
          uri: { value: "urn:test:clarification" },
          content: "Welchen Ort meinst du?",
        },
      ],
      [],
    ];
    llmState.responseText = "In Connewitz kannst du heute einen Baum gießen.";

    const fixture: BenchmarkFixture = {
      id: "RUNNER_D",
      title: "Clarification benchmark",
      kind: "dialogue",
      userTurns: ["Welchen Baum kann ich heute gießen?", "In Connewitz."],
      expectedFlow: {
        clarification: "required" as const,
        requiredMetadataStatuses: [
          "WAITING_FOR_INPUT",
          "REWRITING_QUESTION",
          "GATHERING_DATA",
          "GENERATING_CLARIFICATION",
        ],
        minAssistantMessages: 2,
      },
      requiredSignals: [
        {
          label: "Contains clarification wording",
          value: "Adresse|Stadtteil|Ort",
          axis: "flow_correctness" as const,
          critical: true,
          target: "assistant_any" as const,
          mode: "regex" as const,
          flags: "i",
        },
        {
          label: "Contains Connewitz after clarification",
          value: "Connewitz",
          axis: "grounding" as const,
          critical: true,
          target: "assistant_any" as const,
        },
      ],
      forbiddenSignals: [],
      notes: "clarification path",
    };

    const result = await runBenchmarkCase(fixture);

    expect(result.metadata.map((entry) => entry.status)).toContain("GENERATING_CLARIFICATION");
    expect(result.transcript.filter((entry) => entry.role === "assistant").length).toBeGreaterThanOrEqual(3);
    expect(result.evaluation.status).toBe("pass");
  });

  test("marks a pipeline failure as fail", async () => {
    mockHttpState.shouldFail = true;

    const fixture: BenchmarkFixture = {
      id: "RUNNER_FAIL",
      title: "Failure benchmark",
      kind: "question",
      userTurns: ["Wie viel wurde im Stadtteil Connewitz gegossen?"],
      expectedFlow: {
        clarification: "forbidden" as const,
        requiredMetadataStatuses: ["WAITING_FOR_INPUT", "REWRITING_QUESTION", "GATHERING_DATA"],
        minAssistantMessages: 1,
      },
      requiredSignals: [
        {
          label: "Contains Connewitz",
          value: "Connewitz",
          axis: "grounding" as const,
          critical: true,
          target: "assistant_last" as const,
        },
      ],
      forbiddenSignals: [],
      notes: "failure path",
    };

    const result = await runBenchmarkCase(fixture);

    expect(result.metadata.map((entry) => entry.status)).toContain("ERROR");
    expect(result.evaluation.status).toBe("fail");
  });

  test("renders a readable markdown report", async () => {
    const runResult = await runBenchmarkSuite([
      {
        id: "REPORT_Q",
        title: "Report case",
        kind: "question",
        userTurns: ["Wie viel wurde im Stadtteil Connewitz gegossen?"],
        expectedFlow: {
          clarification: "forbidden" as const,
          requiredMetadataStatuses: ["WAITING_FOR_INPUT", "REWRITING_QUESTION", "GATHERING_DATA"],
          minAssistantMessages: 1,
        },
        requiredSignals: [
          {
            label: "Contains Connewitz",
            value: "Connewitz",
            axis: "grounding" as const,
            critical: true,
            target: "assistant_last" as const,
          },
        ],
        forbiddenSignals: [],
        notes: "report case",
      } satisfies BenchmarkFixture,
    ]);

    const markdown = renderBenchmarkMarkdown(runResult);

    expect(markdown).toContain("# Baumbart Demo Benchmark");
    expect(markdown).toContain("## Overview");
    expect(markdown).toContain("## Recommended Demo Subset");
  });
});
