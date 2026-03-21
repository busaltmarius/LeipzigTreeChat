import type { ChatBotMetadataEvent, ChatBotMetadataStatus } from "@leipzigtreechat/chatbot";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
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
  message: ChatBotMetadataEvent["message"];
  terminal?: ChatBotMetadataEvent["terminal"];
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
