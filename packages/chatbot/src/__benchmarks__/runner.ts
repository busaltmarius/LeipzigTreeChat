import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import { createInitialAgentState } from "../index.js";
import { Nodes } from "../nodes.js";
import type { AgentState } from "../state/index.js";
import { scoreBenchmarkCase } from "./scoring.js";
import type {
  BenchmarkCaseResult,
  BenchmarkFixture,
  BenchmarkMetadataEntry,
  BenchmarkRunResult,
  BenchmarkTranscriptEntry,
  BenchmarkTurnTiming,
} from "./types.js";

export type BenchmarkProgressEvent = {
  completedCases: number;
  totalCases: number;
  result: BenchmarkCaseResult;
};

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

const MAX_STEPS_PER_CASE = 100;
type NodeId = (typeof NODE_IDS)[keyof typeof NODE_IDS];

const serializeMessageContent = (content: BaseMessage["content"]): string => {
  if (typeof content === "string") {
    return content;
  }

  return JSON.stringify(content) ?? "";
};

type TurnState = {
  userPrompt: string;
  startedAt: number;
  firstAssistantResponseAt?: number;
};

type NodeCommand = {
  goto?: unknown;
  update?: unknown;
};

const seedTranscriptFromState = (messages: BaseMessage[]): BenchmarkTranscriptEntry[] => {
  return messages.map((message) => ({
    role: message instanceof AIMessage ? "assistant" : "user",
    content: serializeMessageContent(message.content),
    timestamp: new Date().toISOString(),
    turnIndex: null,
  }));
};

const applyCommandUpdate = (state: Record<string, unknown>, command: NodeCommand) => {
  if (!command.update) {
    return;
  }

  if (Array.isArray(command.update)) {
    Object.assign(state, Object.fromEntries(command.update));
    return;
  }

  Object.assign(state, command.update);
};

const normalizeGoto = (goto: unknown): NodeId => {
  if (typeof goto === "string") {
    return goto as NodeId;
  }

  if (Array.isArray(goto) && typeof goto[0] === "string") {
    return goto[0] as NodeId;
  }

  throw new Error(`Unexpected benchmark command goto: ${String(goto)}`);
};

export const runBenchmarkCase = async (fixture: BenchmarkFixture): Promise<BenchmarkCaseResult> => {
  const state = createInitialAgentState();
  const transcript = seedTranscriptFromState(state.messages);
  const metadata: BenchmarkMetadataEntry[] = [];
  const turnStates: TurnState[] = [];
  let scriptedTurnIndex = -1;
  let consumedTurns = 0;
  let runtimeError: string | undefined;
  const startedAt = Date.now();

  const nodes = Nodes(
    async (message) => {
      const serialized = serializeMessageContent(message.content);
      transcript.push({
        role: "assistant",
        content: serialized,
        timestamp: new Date().toISOString(),
        turnIndex: scriptedTurnIndex >= 0 ? scriptedTurnIndex : null,
      });

      const activeTurn = turnStates[scriptedTurnIndex];
      if (activeTurn && activeTurn.firstAssistantResponseAt === undefined) {
        activeTurn.firstAssistantResponseAt = Date.now();
      }
    },
    async (event) => {
      metadata.push({
        status: event.status,
        message: event.message ?? "",
        timestamp: new Date().toISOString(),
      });
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

  const getNextPrompt = async () => {
    const nextPrompt = fixture.userTurns[consumedTurns];

    if (nextPrompt === undefined) {
      throw new Error("No scripted benchmark input remaining.");
    }

    scriptedTurnIndex = consumedTurns;
    consumedTurns += 1;

    transcript.push({
      role: "user",
      content: nextPrompt,
      timestamp: new Date().toISOString(),
      turnIndex: scriptedTurnIndex,
    });
    turnStates.push({
      userPrompt: nextPrompt,
      startedAt: Date.now(),
    });

    return nextPrompt;
  };

  let currentNode: NodeId = NODE_IDS.userInput;
  let steps = 0;

  try {
    while (steps < MAX_STEPS_PER_CASE) {
      steps += 1;

      if (currentNode === NODE_IDS.userInput && consumedTurns >= fixture.userTurns.length) {
        break;
      }

      let command: NodeCommand;

      switch (currentNode) {
        case NODE_IDS.userInput:
          command = await nodes.UserInputNode({ nextNode: NODE_IDS.router }, getNextPrompt)(state);
          break;
        case NODE_IDS.router:
          command = await nodes.RouterNode({
            questionAnsweringNode: NODE_IDS.rewrite,
            requestClarificationNode: NODE_IDS.clarification,
            responseNode: NODE_IDS.response,
          })(state);
          break;
        case NODE_IDS.rewrite:
          command = await nodes.QuestionRewriteNode({
            nextNode: NODE_IDS.qanary,
          })(state);
          break;
        case NODE_IDS.qanary:
          command = await nodes.QanaryOrchestratorNode({
            routerNode: NODE_IDS.router,
          })(state);
          break;
        case NODE_IDS.clarification:
          command = await nodes.RequestClarificationNode({
            nextNode: NODE_IDS.userInput,
          })(state);
          break;
        case NODE_IDS.response:
          command = await nodes.ResponseNode({
            nextNode: NODE_IDS.userInput,
          })(state);
          break;
        default:
          throw new Error(`Unknown benchmark node: ${currentNode}`);
      }

      applyCommandUpdate(state as Record<string, unknown>, command);
      currentNode = command.goto === undefined ? NODE_IDS.userInput : normalizeGoto(command.goto);

      if (currentNode === NODE_IDS.userInput && consumedTurns >= fixture.userTurns.length) {
        break;
      }
    }

    if (steps >= MAX_STEPS_PER_CASE) {
      runtimeError = `Benchmark exceeded ${MAX_STEPS_PER_CASE} node steps.`;
    }
  } catch (error) {
    runtimeError = error instanceof Error ? error.message : "Unknown benchmark runtime error.";
  }

  const turnTimings: BenchmarkTurnTiming[] = turnStates.map((turnState, index) => ({
    turnIndex: index,
    userPrompt: turnState.userPrompt,
    startedAt: new Date(turnState.startedAt).toISOString(),
    firstAssistantResponseAt:
      turnState.firstAssistantResponseAt !== undefined
        ? new Date(turnState.firstAssistantResponseAt).toISOString()
        : undefined,
    latencyMs:
      turnState.firstAssistantResponseAt !== undefined
        ? turnState.firstAssistantResponseAt - turnState.startedAt
        : undefined,
  }));
  const totalDurationMs = Date.now() - startedAt;
  const result: BenchmarkCaseResult = {
    fixture,
    transcript,
    metadata,
    turnTimings,
    totalDurationMs,
    runtimeError,
    evaluation: {
      status: "fail",
      score: 0,
      failureReason: "Pending evaluation.",
      axes: [],
    },
  };

  result.evaluation = scoreBenchmarkCase(fixture, result);

  return result;
};

export const runBenchmarkSuite = async (
  fixtures: BenchmarkFixture[],
  onProgress?: (event: BenchmarkProgressEvent) => void | Promise<void>
): Promise<BenchmarkRunResult> => {
  const startedAt = new Date().toISOString();
  const startedAtMs = Date.now();
  const cases: BenchmarkCaseResult[] = [];

  for (const fixture of fixtures) {
    const result = await runBenchmarkCase(fixture);
    cases.push(result);

    if (onProgress) {
      await onProgress({
        completedCases: cases.length,
        totalCases: fixtures.length,
        result,
      });
    }
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    totalDurationMs: Date.now() - startedAtMs,
    cases,
  };
};
