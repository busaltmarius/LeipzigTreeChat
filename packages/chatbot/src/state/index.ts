import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import { Annotation, type Messages, messagesStateReducer } from "@langchain/langgraph";
import { Effect } from "effect";
import { MissingMessageError } from "../errors.js";
import { ClarificationConversation } from "./clarification_conversation.js";
import { QanaryFinalAnswer } from "./qanary-types.js";

export { ClarificationConversation } from "./clarification_conversation.js";
export {
  ClarificationAnswerURI,
  ClarificationQuestionURI,
  ConversationURI,
  FinalAnswerURI,
  QanaryClarificationAnswer,
  QanaryClarificationQuestion,
  QanaryFinalAnswer,
} from "./qanary-types.js";

/**
 * High-level conversation mode used by the router to pick the next node.
 */
export type Chatmode = "USER_QUESTION" | "CLARIFICATION" | "RESPONSE";

/**
 * Global state of the chatbot agent
 */
export const AgentStateAnnotation = Annotation.Root({
  /**
   * The messages (AI and human) in the conversation.
   */
  messages: Annotation<BaseMessage[], Messages>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  /**
   * The current chat mode of the agent. ONLY the the RouterNode should modify this!
   */
  chatmode: Annotation<Chatmode>(),
  /**
   * The question asked by the user.
   */
  user_question: Annotation<string>(),
  /**
   * The answer returned by the Qanary pipeline.
   */
  qanary_answer: Annotation<QanaryFinalAnswer | undefined>(),
  /**
   * The clarification conversation in progress, if any.
   */
  clarification: Annotation<ClarificationConversation | undefined>(),
  /**
   * Whether the conversation should end.
   */
  has_ended: Annotation<boolean>(),
});

/**
 * Concrete chatbot state shape produced by `AgentStateAnnotation`.
 */
export type AgentState = typeof AgentStateAnnotation.State;

/**
 * Helper function to get the content of a message as a string
 * @param msg Messge to get content from
 * @returns The message content as a string
 */
export function getMessageContent(msg: BaseMessage): Effect.Effect<string, TypeError> {
  if (typeof msg.content === "string") {
    return Effect.succeed(msg.content);
  } else {
    return Effect.try(() => JSON.stringify(msg.content));
  }
}

/**
 * Helper function to get the last AI message in the conversation
 * @param state The current agent state
 * @returns The last AI message or a MissingMessageError if none found
 */
export function getLastAIMessage(state: AgentState): Effect.Effect<AIMessage, MissingMessageError> {
  const aiMessages = state.messages.filter((m) => m instanceof AIMessage);
  if (aiMessages.length === 0) {
    return Effect.fail(new MissingMessageError());
  }
  const lastMessage = aiMessages[aiMessages.length - 1];
  if (!lastMessage) {
    return Effect.fail(new MissingMessageError());
  }

  return Effect.succeed(lastMessage);
}

/**
 * Helper function to get the last message in the conversation
 * @param state The current agent state
 * @returns The last AI message or a MissingMessageError if none found
 */
export function getLastMessage(state: AgentState): Effect.Effect<BaseMessage, MissingMessageError> {
  const messages = state.messages;
  if (messages.length === 0) {
    return Effect.fail(new MissingMessageError());
  }
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) {
    return Effect.fail(new MissingMessageError());
  }

  return Effect.succeed(lastMessage);
}
