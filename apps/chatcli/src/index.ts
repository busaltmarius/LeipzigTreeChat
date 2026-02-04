import { Terminal } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import { BunRuntime, BunTerminal } from "@effect/platform-bun";
import { AIMessage } from "@langchain/core/messages";
import { ChatBotGraph } from "@leipzigtreechat/chatbot";
import { setConfig } from "@leipzigtreechat/chatbot/config";
import { type AgentState, getLastAIMessage, getMessageContent } from "@leipzigtreechat/chatbot/state";
import { Effect, Logger, LogLevel } from "effect";
import { readLine } from "./readline";
import { handleSystemSignalError, type SystemSignalError } from "./system-signal";

setConfig({
  OPENROUTER_API_KEY: "",
});

const program = Effect.gen(function* () {
  const state: AgentState = {
    has_ended: false,
    input: "",
    messages: [
      new AIMessage({
        content: "Hallo, ich bin der Baumwächter von Leipzig. Wie kann ich dir helfen?",
      }),
    ],
  };

  return yield* run(state);
});

const printChatbotMessage = (state: AgentState) =>
  Effect.gen(function* () {
    const terminal = yield* Terminal.Terminal;
    const lastMessage = yield* getLastAIMessage(state);
    const lastMessageContent = yield* getMessageContent(lastMessage);

    yield* terminal.display(`-- Baumwächter: ${lastMessageContent}\n`);
  });

const runGraphWithUserInput = (state: AgentState) =>
  Effect.gen(function* () {
    const input = yield* Effect.scoped(readLine("-> Deine Nachricht: "));

    return yield* Effect.tryPromise(async () => ChatBotGraph.invoke({ ...state, input }));
  });

type RunType = (
  state: AgentState
) => Effect.Effect<AgentState, PlatformError | TypeError | SystemSignalError, Terminal.Terminal>;
const run: RunType = (state) =>
  Effect.gen(function* () {
    yield* printChatbotMessage(state);

    if (state.has_ended) {
      return state;
    }

    const newState = yield* runGraphWithUserInput(state);

    return yield* Effect.suspend(() => run(newState));
  });

// Run the main function
BunRuntime.runMain(
  program.pipe(
    Effect.catchTag("SystemSignalError", handleSystemSignalError),
    Effect.catchAll((error) => Effect.logFatal(`An error occured: ${error}, ${error.cause ?? ""}`)),
    Effect.provide(Logger.minimumLogLevel(LogLevel.Info)),
    Effect.provide(BunTerminal.layer)
  )
);
