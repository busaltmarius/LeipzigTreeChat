import { dev } from "$app/environment";
import type { Cookies } from "@sveltejs/kit";
import { createInitialAgentState } from "@leipzigtreechat/chatbot";
import type { AgentState } from "@leipzigtreechat/chatbot/state";
import type { ChatMessage } from "$lib/chat/types";

const CHAT_SESSION_COOKIE = "chatui_session";
const CHAT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

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

const ensureSessionCookie = (cookies: Cookies): string => {
	const existingSessionId = cookies.get(CHAT_SESSION_COOKIE);

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

export const getChatSessionState = (cookies: Cookies): AgentState => {
	const sessionId = ensureSessionCookie(cookies);
	const existingState = sessions.get(sessionId);

	if (existingState) {
		return existingState;
	}

	const nextState = createInitialAgentState();
	sessions.set(sessionId, nextState);

	return nextState;
};

export const setChatSessionState = (cookies: Cookies, state: AgentState): AgentState => {
	const sessionId = ensureSessionCookie(cookies);
	sessions.set(sessionId, state);

	return state;
};

export const serializeChatSession = (state: AgentState): ChatMessage[] => {
	return state.messages.map((message) => serializeMessage(message as RuntimeMessage));
};
