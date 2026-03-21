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

export type ChatSocketErrorMessage = {
	type: "chat.error";
	error: string;
	messages: ChatMessage[];
};

export type ChatSocketServerMessage = ChatSocketStateMessage | ChatSocketMessageEvent | ChatSocketErrorMessage;
