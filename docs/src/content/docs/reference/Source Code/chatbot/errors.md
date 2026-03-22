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

- [`chatbot/constants`](../constants)
- `chatbot/errors`
- [`chatbot/graph`](../graph)
- [`chatbot/index`](..)
- [`chatbot/langgraph-runtime`](../langgraph-runtime)
- [`chatbot/llm-service`](../llm-service)
- [`chatbot/metadata`](../metadata)
- [`chatbot/nodes`](../nodes)
- [`chatbot/state/clarification_conversation`](../state/clarification_conversation)
- [`chatbot/state/index`](../state)
- [`chatbot/state/qanary-types`](../state/qanary-types)
- [`chatbot/triplestore-service`](../triplestore-service)
- [`chatbot/unit`](../unit)
