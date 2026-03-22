import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import { ChatBotGraph, type ChatBotMetadataEvent, createInitialAgentState } from "../index.js";
import { scoreBenchmarkCase } from "./scoring.js";
import type {
  BenchmarkCaseResult,
  BenchmarkFixture,
  BenchmarkMetadataEntry,
  BenchmarkRunResult,
  BenchmarkTranscriptEntry,
  BenchmarkTurnTiming,
} from "./types.js";

class BenchmarkInputDepletedError extends Error {
  constructor() {
    super("Benchmark input exhausted.");
    this.name = "BenchmarkInputDepletedError";
  }
}

const isBenchmarkInputDepletedError = (error: unknown): boolean => {
  return (
    error instanceof BenchmarkInputDepletedError ||
    (error instanceof Error &&
      (error.name === "BenchmarkInputDepletedError" || error.message === "Benchmark input exhausted."))
  );
};

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

const seedTranscriptFromState = (messages: BaseMessage[]): BenchmarkTranscriptEntry[] => {
  return messages.map((message) => ({
    role: message instanceof AIMessage ? "assistant" : "user",
    content: serializeMessageContent(message.content),
    timestamp: new Date().toISOString(),
    turnIndex: null,
  }));
};

export const runBenchmarkCase = async (fixture: BenchmarkFixture): Promise<BenchmarkCaseResult> => {
  const state = createInitialAgentState();
  const transcript = seedTranscriptFromState(state.messages);
  const metadata: BenchmarkMetadataEntry[] = [];
  const turnStates: TurnState[] = [];
  let scriptedTurnIndex = -1;
  let runtimeError: string | undefined;
  const startedAt = Date.now();

  const graph = ChatBotGraph(
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
    async () => {
      const nextTurnIndex = scriptedTurnIndex + 1;
      const nextPrompt = fixture.userTurns[nextTurnIndex];

      if (nextPrompt === undefined) {
        throw new BenchmarkInputDepletedError();
      }

      scriptedTurnIndex = nextTurnIndex;
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
    },
    async (event: ChatBotMetadataEvent) => {
      metadata.push({
        status: event.status,
        message: event.message ?? "",
        timestamp: new Date().toISOString(),
      });
    }
  );

  try {
    await graph.invoke(state);
  } catch (error) {
    if (!isBenchmarkInputDepletedError(error)) {
      runtimeError = error instanceof Error ? error.message : "Unknown benchmark runtime error.";
    }
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

export const runBenchmarkSuite = async (fixtures: BenchmarkFixture[]): Promise<BenchmarkRunResult> => {
  const startedAt = new Date().toISOString();
  const startedAtMs = Date.now();
  const cases: BenchmarkCaseResult[] = [];

  for (const fixture of fixtures) {
    cases.push(await runBenchmarkCase(fixture));
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    totalDurationMs: Date.now() - startedAtMs,
    cases,
  };
};
