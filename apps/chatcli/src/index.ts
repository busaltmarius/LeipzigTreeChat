import { Terminal } from "@effect/platform";
import { BunTerminal } from "@effect/platform-bun";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatBotGraph, createInitialAgentState } from "@leipzigtreechat/chatbot";
import { getMessageContent } from "@leipzigtreechat/chatbot/state";
import { Effect } from "effect";
import { readLine } from "./readline";

const printMessage = async (message: BaseMessage) => {
  const program = Effect.gen(function* () {
    const terminal = yield* Terminal.Terminal;
    const content = yield* getMessageContent(message);

    if (message instanceof AIMessage) {
      yield* terminal.display(`-- Baumbart: ${content}\n`);
    } else if (message instanceof HumanMessage) {
      yield* terminal.display(`-- Deine Nachricht: ${content}\n`);
    }
  });

  return Effect.runPromise(program.pipe(Effect.provide(BunTerminal.layer)));
};

const getUserInput = async () => {
  return Effect.runPromise(
    Effect.scoped(
      readLine("-> Deine Nachricht: ").pipe(
        Effect.map((input) => input.trim()),
        Effect.provide(BunTerminal.layer)
      )
    )
  );
};

// Run the main function
async function main() {
  const state = createInitialAgentState();
  const initialMessage = state.messages[0];

  if (initialMessage instanceof AIMessage) {
    await printMessage(initialMessage);
  }
  const graph = ChatBotGraph(printMessage, getUserInput);

  try {
    await graph.invoke(state);
  } catch (error) {
    console.log("Ein Fehler ist aufgetreten:", error);
  }
}

main();
