---
title: chatbot/index
description: Auto-generated source code reference for packages/chatbot/src/index.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/index`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/index.ts`

## Summary

Re-exported from "./graph.js".

## Functions

### createInitialAgentState

```ts

function createInitialAgentState(): AgentState

```

Creates the initial graph state expected by the chatbot runtime.

The state starts in question mode and already contains the assistant greeting
so UIs can render the opening message before the first user turn.

**Returns**
- `AgentState`
**Defined at**: line 24

## Constants

### INITIAL_ASSISTANT_MESSAGE_CONTENT

```ts

const INITIAL_ASSISTANT_MESSAGE_CONTENT: string

```

Initial assistant greeting inserted into a freshly created chatbot state.

**Defined at**: line 15

## Members

### ChatBotGraph

```ts

export { ChatBotGraph }

```

Re-exported from "./graph.js".

**Defined at**: line 4

### CHATBOT_METADATA_MESSAGES

```ts

export { CHATBOT_METADATA_MESSAGES }

```

Re-exported from "./metadata.js".

**Defined at**: line 6

### ChatBotMetadataCallback

```ts

export { type ChatBotMetadataCallback }

```

Re-exported from "./metadata.js".

**Defined at**: line 7

### ChatBotMetadataEvent

```ts

export { type ChatBotMetadataEvent }

```

Re-exported from "./metadata.js".

**Defined at**: line 8

### ChatBotMetadataStatus

```ts

export { type ChatBotMetadataStatus }

```

Re-exported from "./metadata.js".

**Defined at**: line 9

## In chatbot

- [`chatbot/constants`](/source-code/chatbot/constants)
- [`chatbot/errors`](/source-code/chatbot/errors)
- [`chatbot/graph`](/source-code/chatbot/graph)
- `chatbot/index`
- [`chatbot/langgraph-runtime`](/source-code/chatbot/langgraph-runtime)
- [`chatbot/llm-service`](/source-code/chatbot/llm-service)
- [`chatbot/metadata`](/source-code/chatbot/metadata)
- [`chatbot/nodes`](/source-code/chatbot/nodes)
- [`chatbot/state/clarification_conversation`](/source-code/chatbot/state/clarification_conversation)
- [`chatbot/state/index`](/source-code/chatbot/state)
- [`chatbot/state/qanary-types`](/source-code/chatbot/state/qanary-types)
- [`chatbot/triplestore-service`](/source-code/chatbot/triplestore-service)
- [`chatbot/unit`](/source-code/chatbot/unit)
