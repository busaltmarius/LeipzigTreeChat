import { Terminal } from "@effect/platform";
import { BunTerminal } from "@effect/platform-bun";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatBotGraph } from "@leipzigtreechat/chatbot";
import { type AgentState, getMessageContent } from "@leipzigtreechat/chatbot/state";
import { Effect } from "effect";
import { readLine } from "./readline";

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
        Effect.provide(BunTerminal.layer)
      )
    )
  );
};

// Run the main function
async function main() {
  const initialMessage = new AIMessage({
    content: "Hallo, ich bin der Baumwächter von Leipzig. Wie kann ich dir helfen?",
  });
  const state: AgentState = {
    has_ended: false,
    has_user_question: false,
    chatmode: "QUESTION_ANSWERING",
    user_question: "",
    clarification: undefined,
    messages: [initialMessage],
    qanary_answer: undefined,
  };

  await printMessage(initialMessage);

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
