---
title: chatbot/graph
description: Auto-generated source code reference for packages/chatbot/src/graph.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/graph`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/graph.ts`

## Summary

Builds the chatbot state graph with the package's standard node wiring.

## Functions

### ChatBotGraph

```ts

function ChatBotGraph(printMessage: (message: BaseMessage) => Promise<void>, getUserInput: () => Promise<string>, onMetadata: ChatBotMetadataCallback): void

```

Builds the chatbot state graph with the package's standard node wiring.

**Parameters**
- `printMessage` ((message: BaseMessage) => Promise<void>): Called whenever the graph produces an assistant message for the user.
- `getUserInput` (() => Promise<string>): Resolves the next user input whenever the graph waits for input.
- `onMetadata` (ChatBotMetadataCallback): Optional observer for progress and error metadata emitted by the nodes.
**Defined at**: line 22

## In chatbot

- [`chatbot/constants`](/source-code/chatbot/constants)
- [`chatbot/errors`](/source-code/chatbot/errors)
- `chatbot/graph`
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
