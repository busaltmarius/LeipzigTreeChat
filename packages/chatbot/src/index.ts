import { AIMessage } from "@langchain/core/messages";
import { AgentState } from "./state/index.js";

export { ChatBotGraph } from "./graph.js";

export const INITIAL_ASSISTANT_MESSAGE_CONTENT =
  "Hallo, ich bin Baumbart, der Baumwächter von Leipzig. Wie kann ich dir helfen?";

export const createInitialAgentState = (): AgentState => ({
  chatmode: "USER_QUESTION",
  user_question: "",
  qanary_answer: undefined,
  clarification: undefined,
  messages: [
    new AIMessage({
      content: INITIAL_ASSISTANT_MESSAGE_CONTENT,
    }),
  ],
  has_ended: false,
});
