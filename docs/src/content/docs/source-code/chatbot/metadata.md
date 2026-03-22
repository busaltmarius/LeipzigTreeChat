---
title: chatbot/metadata
description: Auto-generated source code reference for packages/chatbot/src/metadata.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/metadata`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/metadata.ts`

## Summary

Progress states emitted while the chatbot graph processes a request.

## Types

### ChatBotMetadataStatus

```ts

type ChatBotMetadataStatus = | "WAITING_FOR_INPUT"
  | "REWRITING_QUESTION"
  | "GATHERING_DATA"
  | "GENERATING_CLARIFICATION"
  | "GENERATING_RESPONSE"
  | "ERROR"

```

Progress states emitted while the chatbot graph processes a request.

**Defined at**: line 6

### ChatBotMetadataEvent

```ts

type ChatBotMetadataEvent = {
  /**
   * Current processing step within the chatbot pipeline.
   */
  status: ChatBotMetadataStatus;
  /**
   * Optional user-facing detail for the current step, mainly used for errors.
   */
  message?: string;
}

```

Metadata event forwarded to UI integrations so they can reflect chatbot progress.

**Defined at**: line 17

### ChatBotMetadataCallback

```ts

type ChatBotMetadataCallback = (event: ChatBotMetadataEvent) => Promise<void> | void

```

Callback invoked whenever the chatbot emits a metadata event.

**Defined at**: line 31

## Constants

### CHATBOT_METADATA_MESSAGES

```ts

const CHATBOT_METADATA_MESSAGES: ReadonlyRecord<ChatBotMetadataStatus, string>

```

Default user-facing messages for each metadata status.

**Defined at**: line 36

## In chatbot

- [`chatbot/constants`](/source-code/chatbot/constants)
- [`chatbot/errors`](/source-code/chatbot/errors)
- [`chatbot/graph`](/source-code/chatbot/graph)
- [`chatbot/index`](/source-code/chatbot)
- [`chatbot/langgraph-runtime`](/source-code/chatbot/langgraph-runtime)
- [`chatbot/llm-service`](/source-code/chatbot/llm-service)
- `chatbot/metadata`
- [`chatbot/nodes`](/source-code/chatbot/nodes)
- [`chatbot/state/clarification_conversation`](/source-code/chatbot/state/clarification_conversation)
- [`chatbot/state/index`](/source-code/chatbot/state)
- [`chatbot/state/qanary-types`](/source-code/chatbot/state/qanary-types)
- [`chatbot/triplestore-service`](/source-code/chatbot/triplestore-service)
- [`chatbot/unit`](/source-code/chatbot/unit)
