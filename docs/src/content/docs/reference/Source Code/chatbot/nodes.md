---
title: chatbot/nodes
description: Auto-generated source code reference for packages/chatbot/src/nodes.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/nodes`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/nodes.ts`

## Summary

Logger that prints the node name in each log message.

## Functions

### NodeLoggerLayer

```ts

function NodeLoggerLayer(nodeName: string): void

```

Logger that prints the node name in each log message.

**Parameters**
- `nodeName` (string): Name of the node that should be logged.
**Defined at**: line 24

### runTimedNode

```ts

function runTimedNode(nodeName: string, effect: Effect.Effect<A, E, LangGraphRuntimeEnvironment>): Promise<A>

```

Runs a node effect inside the shared chatbot runtime and emits timing logs.

**Parameters**
- `nodeName` (string): Name used for scoped logging.
- `effect` (Effect.Effect<A, E, LangGraphRuntimeEnvironment>): Effect implementing the node behavior.
**Returns**
- `Promise<A>`: The resolved node result.
**Defined at**: line 48

### Nodes

```ts

function Nodes(printMessage: (message: BaseMessage) => Promise<void>, onMetadata: ChatBotMetadataCallback | undefined, _nodes: N): void

```

Constructor for Nodes with type-safe routing between them.

**Parameters**
- `printMessage` ((message: BaseMessage) => Promise<void>): Function to print messages, used for updating the user interface
- `onMetadata` (ChatBotMetadataCallback | undefined): Optional callback for progress and error metadata updates
- `_nodes` (N)
**Defined at**: line 72

## In chatbot

- [`chatbot/constants`](../constants)
- [`chatbot/errors`](../errors)
- [`chatbot/graph`](../graph)
- [`chatbot/index`](..)
- [`chatbot/langgraph-runtime`](../langgraph-runtime)
- [`chatbot/llm-service`](../llm-service)
- [`chatbot/metadata`](../metadata)
- `chatbot/nodes`
- [`chatbot/state/clarification_conversation`](../state/clarification_conversation)
- [`chatbot/state/index`](../state)
- [`chatbot/state/qanary-types`](../state/qanary-types)
- [`chatbot/triplestore-service`](../triplestore-service)
- [`chatbot/unit`](../unit)
