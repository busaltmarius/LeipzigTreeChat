import { Terminal } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import { BunRuntime, BunTerminal } from "@effect/platform-bun";
import { AIMessage } from "@langchain/core/messages";

import { ChatBotGraph } from "@leipzigtreechat/chatbot";
import { type AgentState, getLastAIMessage, getMessageContent } from "@leipzigtreechat/chatbot/state";
import { Effect, Logger, LogLevel } from "effect";
import { readLine } from "./readline";
import { handleSystemSignalError, type SystemSignalError } from "./system-signal";

const program = Effect.gen(function* () {
  const state: AgentState = {
    input: "",
    messages: [
      new AIMessage({
        content: "Hi! I am a pizza bot. I can help you order a pizza. What would you like to order?",
      }),
    ],
    active_order: false,
    gathered_order_info: false,
    pizzas: new Map(),
    user_name: undefined,
    current_pizza_name: undefined,
  };

  return yield* run(state);
});

const printChatbotMessage = (state: AgentState) =>
  Effect.gen(function* () {
    const terminal = yield* Terminal.Terminal;
    const lastMessage = yield* getLastAIMessage(state);
    const lastMessageContent = yield* getMessageContent(lastMessage);

    yield* terminal.display(`-- Chatbot: ${lastMessageContent}\n`);
  });

const runGraphWithUserInput = (state: AgentState) =>
  Effect.gen(function* () {
    const input = yield* Effect.scoped(readLine("-> Your response: "));

    return yield* Effect.tryPromise(async () => ChatBotGraph.invoke({ ...state, input }));
  });

type RunType = (
  state: AgentState
) => Effect.Effect<AgentState, PlatformError | TypeError | SystemSignalError, Terminal.Terminal>;
const run: RunType = (state) =>
  Effect.gen(function* () {
    yield* printChatbotMessage(state);

    if (state.gathered_order_info) {
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
