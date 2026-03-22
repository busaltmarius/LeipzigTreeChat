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

- [`chatbot/constants`](/source-code/chatbot/constants)
- [`chatbot/errors`](/source-code/chatbot/errors)
- [`chatbot/graph`](/source-code/chatbot/graph)
- [`chatbot/index`](/source-code/chatbot)
- [`chatbot/langgraph-runtime`](/source-code/chatbot/langgraph-runtime)
- [`chatbot/llm-service`](/source-code/chatbot/llm-service)
- [`chatbot/metadata`](/source-code/chatbot/metadata)
- `chatbot/nodes`
- [`chatbot/state/clarification_conversation`](/source-code/chatbot/state/clarification_conversation)
- [`chatbot/state/index`](/source-code/chatbot/state)
- [`chatbot/state/qanary-types`](/source-code/chatbot/state/qanary-types)
- [`chatbot/triplestore-service`](/source-code/chatbot/triplestore-service)
- [`chatbot/unit`](/source-code/chatbot/unit)
