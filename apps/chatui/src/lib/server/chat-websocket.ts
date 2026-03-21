import type { IncomingMessage } from "node:http";
import { ChatBotGraph } from "@leipzigtreechat/chatbot";
import { type RawData, type WebSocket, WebSocketServer } from "ws";
import type {
  ChatMessage,
  ChatSocketClientMessage,
  ChatSocketErrorMessage,
  ChatSocketMessageEvent,
  ChatSocketServerMessage,
  ChatSocketStateMessage,
} from "$lib/chat/types";
import {
  CHAT_SESSION_COOKIE,
  getChatSessionStateById,
  getValidatedChatSessionId,
  serializeChatSession,
} from "$lib/server/chat-session";

const CHAT_SOCKET_PORT = Number.parseInt(process.env.CHATUI_WS_PORT ?? "3031", 10);
const INVALID_MESSAGE_ERROR = "Die Nachricht konnte nicht verarbeitet werden.";
const INVALID_SESSION_ERROR = "Die Sitzung ist ungültig. Lade die Seite neu.";
const CHAT_FAILURE_ERROR = "Der Chatbot konnte gerade nicht antworten. Bitte versuche es erneut.";

type SocketGlobals = typeof globalThis & {
  __chatuiSocketServer?: WebSocketServer;
};

type RuntimeMessage = {
  content: unknown;
  getType: () => string;
};

const parseCookies = (header: string | undefined): Record<string, string> => {
  if (!header) {
    return {};
  }

  return header.split(";").reduce<Record<string, string>>((cookies, entry) => {
    const [rawName, ...rawValue] = entry.trim().split("=");

    if (!rawName || rawValue.length === 0) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
};

const sendSocketMessage = (socket: WebSocket, message: ChatSocketServerMessage) => {
  socket.send(JSON.stringify(message));
};

const sendSocketState = (socket: WebSocket, sessionId: string) => {
  const stateMessage: ChatSocketStateMessage = {
    type: "chat.state",
    messages: serializeChatSession(getChatSessionStateById(sessionId)),
  };

  sendSocketMessage(socket, stateMessage);
};

const sendSocketError = (socket: WebSocket, sessionId: string, error: string) => {
  const errorMessage: ChatSocketErrorMessage = {
    type: "chat.error",
    error,
    messages: serializeChatSession(getChatSessionStateById(sessionId)),
  };

  sendSocketMessage(socket, errorMessage);
};

const serializeChatMessage = (message: RuntimeMessage): ChatMessage => ({
  role: message.getType() === "human" ? "user" : "assistant",
  content: typeof message.content === "string" ? message.content : (JSON.stringify(message.content) ?? ""),
});

const sendPrintedMessage = (socket: WebSocket, message: RuntimeMessage) => {
  const messageEvent: ChatSocketMessageEvent = {
    type: "chat.message",
    message: serializeChatMessage(message),
  };

  sendSocketMessage(socket, messageEvent);
};

const parseClientMessage = (rawData: RawData): ChatSocketClientMessage | null => {
  try {
    const payload = JSON.parse(rawData.toString()) as Partial<ChatSocketClientMessage> | null;

    if (payload?.type !== "chat.send" || typeof payload.prompt !== "string") {
      return null;
    }

    return {
      type: "chat.send",
      prompt: payload.prompt,
    };
  } catch {
    return null;
  }
};

const getSessionIdFromRequest = (request: IncomingMessage): string | null => {
  const cookies = parseCookies(request.headers.cookie);
  return getValidatedChatSessionId(cookies[CHAT_SESSION_COOKIE]);
};

const registerConnection = (socket: WebSocket, request: IncomingMessage) => {
  const sessionId = getSessionIdFromRequest(request);

  if (!sessionId) {
    const errorMessage: ChatSocketErrorMessage = {
      type: "chat.error",
      error: INVALID_SESSION_ERROR,
      messages: [],
    };

    sendSocketMessage(socket, errorMessage);
    socket.close();
    return;
  }

  const pendingPrompts: string[] = [];
  const state = getChatSessionStateById(sessionId);
  let pendingPromptResolver: ((value: string) => void) | null = null;
  let pendingPromptRejecter: ((reason?: unknown) => void) | null = null;
  let isClosed = false;
  const chatbot = ChatBotGraph(
    async (message) => {
      sendPrintedMessage(socket, message);
    },
    async () => {
      const nextPrompt = pendingPrompts.shift();

      if (nextPrompt !== undefined) {
        return nextPrompt;
      }

      return await new Promise<string>((resolve, reject) => {
        pendingPromptResolver = resolve;
        pendingPromptRejecter = reject;
      });
    }
  );

  const enqueuePrompt = (prompt: string) => {
    if (pendingPromptResolver) {
      const resolve = pendingPromptResolver;
      pendingPromptResolver = null;
      pendingPromptRejecter = null;
      resolve(prompt);
      return;
    }

    pendingPrompts.push(prompt);
  };

  sendSocketState(socket, sessionId);

  void (async () => {
    try {
      await chatbot.invoke(state);
    } catch (error) {
      if (isClosed) {
        return;
      }

      console.error("Failed to run websocket chatbot", error);
      sendSocketError(socket, sessionId, CHAT_FAILURE_ERROR);
    } finally {
      if (!isClosed && state.has_ended) {
        socket.close(1000, "Conversation finished.");
      }
    }
  })();

  socket.on("message", async (rawData: RawData) => {
    const payload = parseClientMessage(rawData);

    if (!payload) {
      sendSocketError(socket, sessionId, INVALID_MESSAGE_ERROR);
      return;
    }

    const prompt = payload.prompt.trim();

    if (!prompt) {
      sendSocketError(socket, sessionId, INVALID_MESSAGE_ERROR);
      return;
    }

    enqueuePrompt(prompt);
  });

  socket.on("close", () => {
    isClosed = true;

    if (pendingPromptRejecter) {
      pendingPromptRejecter(new Error("WebSocket connection closed."));
      pendingPromptResolver = null;
      pendingPromptRejecter = null;
    }
  });
};

export const ensureChatWebSocketServer = (): WebSocketServer => {
  const globals = globalThis as SocketGlobals;

  if (globals.__chatuiSocketServer) {
    return globals.__chatuiSocketServer;
  }

  const socketServer = new WebSocketServer({
    port: CHAT_SOCKET_PORT,
  });

  socketServer.on("connection", registerConnection);
  socketServer.on("error", (error: Error) => {
    console.error("Chat websocket server error", error);
  });

  globals.__chatuiSocketServer = socketServer;

  return socketServer;
};

export const getChatWebSocketUrl = (url: URL): string => {
  const protocol = url.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${url.hostname}:${CHAT_SOCKET_PORT}`;
};
