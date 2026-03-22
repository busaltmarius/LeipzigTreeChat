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

- [`chatbot/constants`](/source-code/chatbot/constants)
- [`chatbot/errors`](/source-code/chatbot/errors)
- [`chatbot/graph`](/source-code/chatbot/graph)
- [`chatbot/index`](/source-code/chatbot)
- [`chatbot/langgraph-runtime`](/source-code/chatbot/langgraph-runtime)
- [`chatbot/llm-service`](/source-code/chatbot/llm-service)
- [`chatbot/metadata`](/source-code/chatbot/metadata)
- [`chatbot/nodes`](/source-code/chatbot/nodes)
- [`chatbot/state/clarification_conversation`](/source-code/chatbot/state/clarification_conversation)
- [`chatbot/state/index`](/source-code/chatbot/state)
- [`chatbot/state/qanary-types`](/source-code/chatbot/state/qanary-types)
- `chatbot/triplestore-service`
- [`chatbot/unit`](/source-code/chatbot/unit)
