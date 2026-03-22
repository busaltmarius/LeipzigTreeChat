---
title: chatbot/errors
description: Auto-generated source code reference for packages/chatbot/src/errors.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/errors`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/errors.ts`

## Summary

Indicates that a user message failed chatbot-specific validation.

## Classes

### InvalidInputError

```ts

class InvalidInputError extends Data.TaggedError("InvalidInputError")<{
  /**
   * Human-readable explanation of the validation failure.
   */
  reason: string;
}>

```

Indicates that a user message failed chatbot-specific validation.

**Extends**: `Data.TaggedError("InvalidInputError")<{
  /**
   * Human-readable explanation of the validation failure.
   */
  reason: string;
}>`
**Defined at**: line 6

### MissingMessageError

```ts

class MissingMessageError extends Data.TaggedError("MissingMessageError")<{}>

```

Indicates that the expected message was missing from the current agent state.

**Extends**: `Data.TaggedError("MissingMessageError")<{}>`
**Defined at**: line 16

## In chatbot

- [`chatbot/constants`](/source-code/chatbot/constants)
- `chatbot/errors`
- [`chatbot/graph`](/source-code/chatbot/graph)
- [`chatbot/index`](/source-code/chatbot)
- [`chatbot/langgraph-runtime`](/source-code/chatbot/langgraph-runtime)
- [`chatbot/llm-service`](/source-code/chatbot/llm-service)
- [`chatbot/metadata`](/source-code/chatbot/metadata)
- [`chatbot/nodes`](/source-code/chatbot/nodes)
- [`chatbot/state/clarification_conversation`](/source-code/chatbot/state/clarification_conversation)
- [`chatbot/state/index`](/source-code/chatbot/state)
- [`chatbot/state/qanary-types`](/source-code/chatbot/state/qanary-types)
- [`chatbot/triplestore-service`](/source-code/chatbot/triplestore-service)
- [`chatbot/unit`](/source-code/chatbot/unit)
