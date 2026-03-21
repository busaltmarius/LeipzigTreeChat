import { createInitialAgentState } from "@leipzigtreechat/chatbot";
import type { AgentState } from "@leipzigtreechat/chatbot/state";
import type { Cookies } from "@sveltejs/kit";
import { dev } from "$app/environment";
import type { ChatMessage } from "$lib/chat/types";

export const CHAT_SESSION_COOKIE = "chatui_session";
const CHAT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const sessions = new Map<string, AgentState>();

type RuntimeMessage = {
  content: unknown;
  getType?: () => string;
};

const normalizeContent = (content: unknown): string => {
  if (typeof content === "string") {
    return content;
  }

  const serializedContent = JSON.stringify(content);

  return serializedContent ?? "";
};

const serializeMessage = (message: RuntimeMessage): ChatMessage => ({
  role: message.getType?.() === "human" ? "user" : "assistant",
  content: normalizeContent(message.content),
});

export const getValidatedChatSessionId = (value: string | undefined): string | null => {
  if (!value || !UUID_PATTERN.test(value)) {
    return null;
  }

  return value;
};

export const getOrCreateChatSessionId = (cookies: Cookies): string => {
  const existingSessionId = getValidatedChatSessionId(cookies.get(CHAT_SESSION_COOKIE));

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = crypto.randomUUID();

  cookies.set(CHAT_SESSION_COOKIE, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    maxAge: CHAT_SESSION_TTL_SECONDS,
  });

  return sessionId;
};

export const getChatSessionStateById = (sessionId: string): AgentState => {
  const existingState = sessions.get(sessionId);

  if (existingState) {
    return existingState;
  }

  const nextState = createInitialAgentState();
  sessions.set(sessionId, nextState);

  return nextState;
};

export const getChatSessionState = (cookies: Cookies): AgentState => {
  return getChatSessionStateById(getOrCreateChatSessionId(cookies));
};

export const setChatSessionState = (cookies: Cookies, state: AgentState): AgentState => {
  const sessionId = getOrCreateChatSessionId(cookies);
  sessions.set(sessionId, state);

  return state;
};

export const serializeChatSession = (state: AgentState): ChatMessage[] => {
  return state.messages.map((message) => serializeMessage(message as RuntimeMessage));
};
