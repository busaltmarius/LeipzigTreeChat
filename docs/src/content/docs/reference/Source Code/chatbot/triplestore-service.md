---
title: chatbot/triplestore-service
description: Auto-generated source code reference for packages/chatbot/src/triplestore-service.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/triplestore-service`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/triplestore-service.ts`

## Summary

Wraps SPARQL query failures so triplestore access can be modeled in Effect.

## Classes

### SPARQLError

```ts

class SPARQLError extends Data.TaggedError("SPARQLError")<{ reason: any }>

```

Wraps SPARQL query failures so triplestore access can be modeled in Effect.

**Extends**: `Data.TaggedError("SPARQLError")<{ reason: any }>`
**Methods**
- `constructor(reason: any)`
**Defined at**: line 15

### NotFoundError

```ts

class NotFoundError extends Data.TaggedError("NotFoundError")<{ itemType: QanaryItemType }>

```

Indicates that the requested Qanary annotation type was not present in the graph.

**Extends**: `Data.TaggedError("NotFoundError")<{ itemType: QanaryItemType }>`
**Methods**
- `constructor(itemType: QanaryItemType)`
**Defined at**: line 26

### TriplestoreService

```ts

class TriplestoreService extends Context.Tag("Triplestore")<TriplestoreService, TriplestoreInterface>()

```

Effect service for querying clarification data from the configured triplestore.

**Extends**: `Context.Tag("Triplestore")<TriplestoreService, TriplestoreInterface>()`
**Properties**
- `Live` (unknown): Live implementation backed by the `TRIPLESTORE_URL` environment config.
**Defined at**: line 49

## Types

### TriplestoreInterface

```ts

type TriplestoreInterface = {
  /**
   * Loads all non-empty clarification annotations from the given named graph.
   */
  readonly queryClarifications: (graphUri: string) => Effect.Effect<Array<QanaryClarificationQuestion>, SPARQLError>;
  /**
   * Loads the most recent non-empty final answer annotation from the given named graph.
   */
  readonly queryFinalAnswer: (graphUri: string) => Effect.Effect<QanaryFinalAnswer, NotFoundError | SPARQLError>;
}

```

Contract for triplestore reads needed by the chatbot package.

**Defined at**: line 35

## In chatbot

- [`chatbot/constants`](../constants)
- [`chatbot/errors`](../errors)
- [`chatbot/graph`](../graph)
- [`chatbot/index`](..)
- [`chatbot/langgraph-runtime`](../langgraph-runtime)
- [`chatbot/llm-service`](../llm-service)
- [`chatbot/metadata`](../metadata)
- [`chatbot/nodes`](../nodes)
- [`chatbot/state/clarification_conversation`](../state/clarification_conversation)
- [`chatbot/state/index`](../state)
- [`chatbot/state/qanary-types`](../state/qanary-types)
- `chatbot/triplestore-service`
- [`chatbot/unit`](../unit)
