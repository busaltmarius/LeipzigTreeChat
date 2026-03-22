import { AIMessage } from "@langchain/core/messages";
import type { AgentState } from "./state/index.js";

export { ChatBotGraph } from "./graph.js";
export {
  CHATBOT_METADATA_MESSAGES,
  type ChatBotMetadataCallback,
  type ChatBotMetadataEvent,
  type ChatBotMetadataStatus,
} from "./metadata.js";

/**
 * Initial assistant greeting inserted into a freshly created chatbot state.
 */
export const INITIAL_ASSISTANT_MESSAGE_CONTENT =
  "Hallo, ich bin Baumbart, der Baumwächter von Leipzig. Wie kann ich dir helfen?";

/**
 * Creates the initial graph state expected by the chatbot runtime.
 *
 * The state starts in question mode and already contains the assistant greeting
 * so UIs can render the opening message before the first user turn.
 */
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
