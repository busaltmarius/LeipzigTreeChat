import { Terminal } from "@effect/platform";
import { BunTerminal } from "@effect/platform-bun";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatBotGraph } from "@leipzigtreechat/chatbot";
import { type AgentState, getLastAIMessage, getMessageContent } from "@leipzigtreechat/chatbot/state";
import { Effect } from "effect";
import { readLine } from "./readline";
import { handleSystemSignalError, type SystemSignalError } from "./system-signal";

const printMessage = async (message: BaseMessage) => {
  const program = Effect.gen(function* () {
    const terminal = yield* Terminal.Terminal;
    const content = yield* getMessageContent(message);

    if (message instanceof AIMessage) {
      yield* terminal.display(`-- Baumwächter: ${content}\n`);
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
        Effect.catchTag("SystemSignalError", handleSystemSignalError),
        Effect.provide(BunTerminal.layer)
      )
    )
  );
};

// Run the main function
async function main() {
  const state: AgentState = {
    has_ended: false,
    input: "",
    messages: [
      new AIMessage({
        content: "Hallo, ich bin der Baumwächter von Leipzig. Wie kann ich dir helfen?",
      }),
    ],
  };

  await printMessage(getLastAIMessage(state));

  const chatBotGraph = ChatBotGraph(printMessage, getUserInput);

  while (!state.has_ended) {
    try {
      await chatBotGraph.invoke(state);
    } catch (error) {
      console.log("Ein Fehler ist aufgetreten:", error);
    }
  }
}

main();
