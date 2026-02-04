import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import { Annotation, type Messages, messagesStateReducer } from "@langchain/langgraph";

import { Effect } from "effect";

import { MissingMessageError } from "./errors.js";

export const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[], Messages>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  input: Annotation<string>(),
});

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
