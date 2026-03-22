---
title: chatui/lib/chat/types
description: Auto-generated source code reference for apps/chatui/src/lib/chat/types.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatui/lib/chat/types`

- Package: `chatui`
- Source file: `apps/chatui/src/lib/chat/types.ts`

## Summary

No summary is available for this file.

## Types

### ChatMessage

```ts

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  variant?: "default" | "error";
}

```

**Defined at**: line 3

### ChatSocketClientMessage

```ts

type ChatSocketClientMessage = {
  type: "chat.send";
  prompt: string;
}

```

**Defined at**: line 9

### ChatSocketStateMessage

```ts

type ChatSocketStateMessage = {
  type: "chat.state";
  messages: ChatMessage[];
}

```

**Defined at**: line 14

### ChatSocketMessageEvent

```ts

type ChatSocketMessageEvent = {
  type: "chat.message";
  message: ChatMessage;
}

```

**Defined at**: line 19

### ChatSocketMetadataEvent

```ts

type ChatSocketMetadataEvent = {
  type: "chat.metadata";
  status: ChatBotMetadataStatus;
  message: string;
}

```

**Defined at**: line 24

### ChatSocketErrorMessage

```ts

type ChatSocketErrorMessage = {
  type: "chat.error";
  error: string;
  messages: ChatMessage[];
}

```

**Defined at**: line 30

### ChatSocketServerMessage

```ts

type ChatSocketServerMessage = | ChatSocketStateMessage
  | ChatSocketMessageEvent
  | ChatSocketMetadataEvent
  | ChatSocketErrorMessage

```

**Defined at**: line 36

## In chatui

- `chatui/lib/chat/types`
- [`chatui/lib/index`](/source-code/chatui/lib)
- [`chatui/lib/server/chat-session`](/source-code/chatui/lib/server/chat-session)
- [`chatui/lib/server/chat-websocket`](/source-code/chatui/lib/server/chat-websocket)
- [`chatui/routes/+page.server`](/source-code/chatui/routes/+page.server)
