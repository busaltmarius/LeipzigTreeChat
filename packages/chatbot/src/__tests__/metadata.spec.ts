import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Context, Data, Effect, Layer } from "effect";

const mockHttpState = {
  shouldFail: false,
  body: {
    inGraph: "urn:test:graph",
  },
};

const llmMocks = {
  rewriteQuestion: mock(async (_conversationHistory: string | undefined, input: string) => `rewritten:${input}`),
  generateChatbotResponse: mock(async () => "Antwort"),
  generateClarificationQuestion: mock(async () => "Rueckfrage"),
};

const triplestoreMocks = {
  queryClarifications: mock<(graphUri: string) => Effect.Effect<Array<{ uri: unknown; content: string }>, never, never>>(
    (_graphUri: string) => Effect.succeed([])
  ),
  queryFinalAnswer: mock<(graphUri: string) => Effect.Effect<unknown, unknown, never>>((_graphUri: string) =>
    Effect.succeed({
      _tag: "QanaryFinalAnswer" as const,
      uri: { value: "urn:test:answer" },
      content: "Antwortdaten",
    })
  ),
};

const MockHttpClientTag = Context.GenericTag<{ execute: (request: unknown) => Effect.Effect<unknown> }>("MockHttpClient");
const MockLLMServiceTag = Context.GenericTag<{
  rewriteQuestion: (conversationHistory: string | undefined, input: string) => Effect.Effect<string>;
  generateChatbotResponse: () => Effect.Effect<string>;
  generateClarificationQuestion: () => Effect.Effect<string>;
}>("MockLLMService");
const MockTriplestoreServiceTag = Context.GenericTag<{
  queryClarifications: (graphUri: string) => Effect.Effect<unknown[]>;
  queryFinalAnswer: (graphUri: string) => Effect.Effect<unknown, unknown>;
}>("MockTriplestoreService");

const createRequest = (url: string) => ({
  url,
  params: {} as Record<string, string | string[]>,
  pipe(...operations: Array<(value: any) => any>) {
    return operations.reduce((value, operation) => operation(value), this as any);
  },
});

mock.module("@effect/platform", () => ({
  HttpClient: {
    HttpClient: MockHttpClientTag,
  },
  HttpClientRequest: {
    post: (url: string) => createRequest(url),
    setUrlParams:
      (params: Record<string, string | string[]>) =>
      (request: ReturnType<typeof createRequest>) => ({
        ...request,
        params,
      }),
  },
  HttpClientResponse: {
    filterStatusOk:
      (response: { status: number }) =>
      response.status >= 200 && response.status < 300 ? Effect.succeed(response) : Effect.fail(new Error("Not OK")),
    schemaBodyJson:
      (_schema: unknown) =>
      (response: { body: unknown }) =>
        Effect.succeed(response.body),
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
  const layer = Layer.mergeAll(
    Layer.succeed(MockHttpClientTag, {
      execute: ((_request: unknown) =>
        mockHttpState.shouldFail
          ? Effect.fail(new Error("HTTP request failed"))
          : Effect.succeed({
              status: 200,
              body: mockHttpState.body,
            })) as any,
    }),
    Layer.succeed(MockLLMServiceTag, {
      rewriteQuestion: (conversationHistory: string | undefined, input: string) =>
        Effect.promise(() => llmMocks.rewriteQuestion(conversationHistory, input)),
      generateChatbotResponse: () => Effect.promise(() => llmMocks.generateChatbotResponse()),
      generateClarificationQuestion: () => Effect.promise(() => llmMocks.generateClarificationQuestion()),
    }),
    Layer.succeed(MockTriplestoreServiceTag, {
      queryClarifications: (graphUri: string) => triplestoreMocks.queryClarifications(graphUri),
      queryFinalAnswer: (graphUri: string) => triplestoreMocks.queryFinalAnswer(graphUri),
    })
  );

  return {
    runLangGraphRuntime: (effect: Effect.Effect<unknown, unknown, never>) => Effect.runPromise(effect.pipe(Effect.provide(layer))),
  };
});

const { Nodes } = await import("../nodes.js");
const { createInitialAgentState } = await import("../index.js");
const { ClarificationQuestionURI } = await import("../state/index.js");

const NODE_IDS = {
  start: "start",
  end: "end",
  response: "response",
  qanary: "qanary",
  router: "router",
  userInput: "user_input",
  clarification: "clarification",
  rewrite: "rewrite",
} as const;

const createNodeSuite = (metadataEvents: string[]) =>
  Nodes(
    async () => {},
    async (event) => {
      metadataEvents.push(event.status);
    },
    NODE_IDS.start,
    NODE_IDS.end,
    NODE_IDS.response,
    NODE_IDS.qanary,
    NODE_IDS.router,
    NODE_IDS.userInput,
    NODE_IDS.clarification,
    NODE_IDS.rewrite
  );

const applyCommandUpdate = (state: Record<string, unknown>, command: { update?: unknown }) => {
  if (!command.update) {
    return;
  }

  if (Array.isArray(command.update)) {
    Object.assign(state, Object.fromEntries(command.update));
    return;
  }

  Object.assign(state, command.update);
};

beforeEach(() => {
  mockHttpState.shouldFail = false;
  mockHttpState.body = {
    inGraph: "urn:test:graph",
  };
  llmMocks.rewriteQuestion.mockClear();
  llmMocks.generateChatbotResponse.mockClear();
  llmMocks.generateClarificationQuestion.mockClear();
  triplestoreMocks.queryClarifications.mockClear();
  triplestoreMocks.queryFinalAnswer.mockClear();
  triplestoreMocks.queryClarifications.mockImplementation((_graphUri: string) => Effect.succeed([]));
  triplestoreMocks.queryFinalAnswer.mockImplementation((_graphUri: string) =>
    Effect.succeed({
      _tag: "QanaryFinalAnswer" as const,
      uri: { value: "urn:test:answer" },
      content: "Antwortdaten",
    })
  );
  process.env.QANARY_API_BASE_URL = "http://example.test/";
});

describe("chatbot metadata events", () => {
  test("emits metadata in order for the normal response path", async () => {
    const metadataEvents: string[] = [];
    const state = createInitialAgentState();
    const nodes = createNodeSuite(metadataEvents);

    applyCommandUpdate(
      state,
      await nodes.UserInputNode({ nextNode: NODE_IDS.router }, async () => "Wie alt ist der Baum?")(state)
    );
    applyCommandUpdate(
      state,
      await nodes.RouterNode({
        questionAnsweringNode: NODE_IDS.rewrite,
        requestClarificationNode: NODE_IDS.clarification,
        responseNode: NODE_IDS.response,
      })(state)
    );
    applyCommandUpdate(state, await nodes.QuestionRewriteNode({ nextNode: NODE_IDS.qanary })(state));
    applyCommandUpdate(state, await nodes.QanaryOrchestratorNode({ routerNode: NODE_IDS.router })(state));
    applyCommandUpdate(
      state,
      await nodes.RouterNode({
        questionAnsweringNode: NODE_IDS.rewrite,
        requestClarificationNode: NODE_IDS.clarification,
        responseNode: NODE_IDS.response,
      })(state)
    );
    applyCommandUpdate(state, await nodes.ResponseNode({ nextNode: NODE_IDS.userInput })(state));

    await expect(
      nodes.UserInputNode({ nextNode: NODE_IDS.router }, async () => {
        throw new Error("stop");
      })(state)
    ).rejects.toThrow("stop");

    expect(metadataEvents).toEqual([
      "WAITING_FOR_INPUT",
      "REWRITING_QUESTION",
      "GATHERING_DATA",
      "GENERATING_RESPONSE",
      "WAITING_FOR_INPUT",
    ]);
  });

  test("emits metadata in order for the clarification path", async () => {
    const metadataEvents: string[] = [];
    const state = createInitialAgentState();
    const nodes = createNodeSuite(metadataEvents);

    triplestoreMocks.queryClarifications.mockImplementation((_graphUri: string) =>
      Effect.succeed([
        {
          uri: new ClarificationQuestionURI("urn:test:clarification"),
          content: "Welchen Baum meinst du genau?",
        },
      ])
    );

    applyCommandUpdate(
      state,
      await nodes.UserInputNode({ nextNode: NODE_IDS.router }, async () => "Erzaehl mir etwas ueber den Baum")(state)
    );
    applyCommandUpdate(
      state,
      await nodes.RouterNode({
        questionAnsweringNode: NODE_IDS.rewrite,
        requestClarificationNode: NODE_IDS.clarification,
        responseNode: NODE_IDS.response,
      })(state)
    );
    applyCommandUpdate(state, await nodes.QuestionRewriteNode({ nextNode: NODE_IDS.qanary })(state));
    applyCommandUpdate(state, await nodes.QanaryOrchestratorNode({ routerNode: NODE_IDS.router })(state));
    applyCommandUpdate(
      state,
      await nodes.RouterNode({
        questionAnsweringNode: NODE_IDS.rewrite,
        requestClarificationNode: NODE_IDS.clarification,
        responseNode: NODE_IDS.response,
      })(state)
    );
    applyCommandUpdate(state, await nodes.RequestClarificationNode({ nextNode: NODE_IDS.userInput })(state));

    await expect(
      nodes.UserInputNode({ nextNode: NODE_IDS.router }, async () => {
        throw new Error("stop");
      })(state)
    ).rejects.toThrow("stop");

    expect(metadataEvents).toEqual([
      "WAITING_FOR_INPUT",
      "REWRITING_QUESTION",
      "GATHERING_DATA",
      "GENERATING_CLARIFICATION",
      "WAITING_FOR_INPUT",
    ]);
  });

  test("emits an error metadata event on pipeline failure", async () => {
    const metadataEvents: string[] = [];
    const state = createInitialAgentState();
    const nodes = createNodeSuite(metadataEvents);

    mockHttpState.shouldFail = true;

    applyCommandUpdate(
      state,
      await nodes.UserInputNode({ nextNode: NODE_IDS.router }, async () => "Warum fehlt die Antwort?")(state)
    );
    applyCommandUpdate(
      state,
      await nodes.RouterNode({
        questionAnsweringNode: NODE_IDS.rewrite,
        requestClarificationNode: NODE_IDS.clarification,
        responseNode: NODE_IDS.response,
      })(state)
    );
    applyCommandUpdate(state, await nodes.QuestionRewriteNode({ nextNode: NODE_IDS.qanary })(state));
    applyCommandUpdate(state, await nodes.QanaryOrchestratorNode({ routerNode: NODE_IDS.router })(state));

    expect(metadataEvents).toEqual(["WAITING_FOR_INPUT", "REWRITING_QUESTION", "GATHERING_DATA", "ERROR"]);
  });
});
