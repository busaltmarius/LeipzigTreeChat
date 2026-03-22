---
title: chatui/lib/server/chat-session
description: Auto-generated source code reference for apps/chatui/src/lib/server/chat-session.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatui/lib/server/chat-session`

- Package: `chatui`
- Source file: `apps/chatui/src/lib/server/chat-session.ts`

## Summary

No summary is available for this file.

## Functions

### getValidatedChatSessionId

```ts

function getValidatedChatSessionId(value: string | undefined): string | null

```

**Parameters**
- `value` (string | undefined)
**Returns**
- `string | null`
**Defined at**: line 33

### getOrCreateChatSessionId

```ts

function getOrCreateChatSessionId(cookies: Cookies): string

```

**Parameters**
- `cookies` (Cookies)
**Returns**
- `string`
**Defined at**: line 41

### getChatSessionStateById

```ts

function getChatSessionStateById(sessionId: string): AgentState

```

**Parameters**
- `sessionId` (string)
**Returns**
- `AgentState`
**Defined at**: line 61

### getChatSessionState

```ts

function getChatSessionState(cookies: Cookies): AgentState

```

**Parameters**
- `cookies` (Cookies)
**Returns**
- `AgentState`
**Defined at**: line 74

### setChatSessionState

```ts

function setChatSessionState(cookies: Cookies, state: AgentState): AgentState

```

**Parameters**
- `cookies` (Cookies)
- `state` (AgentState)
**Returns**
- `AgentState`
**Defined at**: line 78

### serializeChatSession

```ts

function serializeChatSession(state: AgentState): ChatMessage[]

```

**Parameters**
- `state` (AgentState)
**Returns**
- `ChatMessage[]`
**Defined at**: line 85

## Constants

### CHAT_SESSION_COOKIE

```ts

const CHAT_SESSION_COOKIE: string

```

**Defined at**: line 7

## In chatui

- [`chatui/lib/chat/types`](/source-code/chatui/lib/chat/types)
- [`chatui/lib/index`](/source-code/chatui/lib)
- `chatui/lib/server/chat-session`
- [`chatui/lib/server/chat-websocket`](/source-code/chatui/lib/server/chat-websocket)
- [`chatui/routes/+page.server`](/source-code/chatui/routes/+page.server)
