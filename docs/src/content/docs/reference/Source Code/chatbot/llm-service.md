---
title: chatbot/llm-service
description: Auto-generated source code reference for packages/chatbot/src/llm-service.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/llm-service`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/llm-service.ts`

## Summary

OpenRouter client type used by the chatbot's LLM service layer.

## Classes

### LLMServiceError

```ts

class LLMServiceError extends Data.TaggedError("LLMServiceError")<{
  readonly operation: string;
  readonly reason: unknown;
}>

```

Wraps failures from outbound LLM operations with the originating operation name.

**Extends**: `Data.TaggedError("LLMServiceError")<{
  readonly operation: string;
  readonly reason: unknown;
}>`
**Methods**
- `constructor(operation: string, reason: unknown)`
**Defined at**: line 18

### OpenRouter

```ts

class OpenRouter extends Context.Tag("OpenRouter")<
  OpenRouter,
  {
    readonly client: () => Effect.Effect<OpenRouterClient, never, never>;
  }
>()

```

Effect service that provides access to the configured OpenRouter client.

**Extends**: `Context.Tag("OpenRouter")<
  OpenRouter,
  {
    readonly client: () => Effect.Effect<OpenRouterClient, never, never>;
  }
>()`
**Properties**
- `Live` (unknown)
**Defined at**: line 30

### LLMService

```ts

class LLMService extends Context.Tag("LLMService")<LLMService, LLMServiceInterface>()

```

Effect service that wraps all LLM-backed chatbot text generation.

**Extends**: `Context.Tag("LLMService")<LLMService, LLMServiceInterface>()`
**Properties**
- `Live` (unknown)
**Defined at**: line 96

## Types

### OpenRouterClient

```ts

type OpenRouterClient = ReturnType<typeof createOpenRouter>

```

OpenRouter client type used by the chatbot's LLM service layer.

**Defined at**: line 13

## In chatbot

- [`chatbot/constants`](../constants)
- [`chatbot/errors`](../errors)
- [`chatbot/graph`](../graph)
- [`chatbot/index`](..)
- [`chatbot/langgraph-runtime`](../langgraph-runtime)
- `chatbot/llm-service`
- [`chatbot/metadata`](../metadata)
- [`chatbot/nodes`](../nodes)
- [`chatbot/state/clarification_conversation`](../state/clarification_conversation)
- [`chatbot/state/index`](../state)
- [`chatbot/state/qanary-types`](../state/qanary-types)
- [`chatbot/triplestore-service`](../triplestore-service)
- [`chatbot/unit`](../unit)
