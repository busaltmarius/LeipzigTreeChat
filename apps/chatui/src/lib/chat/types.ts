import type { ChatBotMetadataStatus } from "@leipzigtreechat/chatbot";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  variant?: "default" | "error";
};

export type ChatSocketClientMessage = {
  type: "chat.send";
  prompt: string;
};

export type ChatSocketStateMessage = {
  type: "chat.state";
  messages: ChatMessage[];
};

export type ChatSocketMessageEvent = {
  type: "chat.message";
  message: ChatMessage;
};

export type ChatSocketMetadataEvent = {
  type: "chat.metadata";
  status: ChatBotMetadataStatus;
  message: string;
};

export type ChatSocketErrorMessage = {
  type: "chat.error";
  error: string;
  messages: ChatMessage[];
};

export type ChatSocketServerMessage =
  | ChatSocketStateMessage
  | ChatSocketMessageEvent
  | ChatSocketMetadataEvent
  | ChatSocketErrorMessage;
