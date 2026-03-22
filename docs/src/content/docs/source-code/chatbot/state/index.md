---
title: chatbot/state/index
description: Auto-generated source code reference for packages/chatbot/src/state/index.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/state/index`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/state/index.ts`

## Summary

Re-exported from "./clarification_conversation.js".

## Functions

### getMessageContent

```ts

function getMessageContent(msg: BaseMessage): Effect.Effect<string, TypeError>

```

Helper function to get the content of a message as a string

**Parameters**
- `msg` (BaseMessage): Messge to get content from
**Returns**
- `Effect.Effect<string, TypeError>`: The message content as a string
**Defined at**: line 67

### getLastAIMessage

```ts

function getLastAIMessage(state: AgentState): Effect.Effect<AIMessage, MissingMessageError>

```

Helper function to get the last AI message in the conversation

**Parameters**
- `state` (AgentState): The current agent state
**Returns**
- `Effect.Effect<AIMessage, MissingMessageError>`: The last AI message or a MissingMessageError if none found
**Defined at**: line 80

### getLastMessage

```ts

function getLastMessage(state: AgentState): Effect.Effect<BaseMessage, MissingMessageError>

```

Helper function to get the last message in the conversation

**Parameters**
- `state` (AgentState): The current agent state
**Returns**
- `Effect.Effect<BaseMessage, MissingMessageError>`: The last AI message or a MissingMessageError if none found
**Defined at**: line 98

## Types

### Chatmode

```ts

type Chatmode = "USER_QUESTION" | "CLARIFICATION" | "RESPONSE"

```

High-level conversation mode used by the router to pick the next node.

**Defined at**: line 22

### AgentState

```ts

type AgentState = typeof AgentStateAnnotation.State

```

Concrete chatbot state shape produced by `AgentStateAnnotation`.

**Defined at**: line 60

## Constants

### AgentStateAnnotation

```ts

const AgentStateAnnotation: unknown

```

Global state of the chatbot agent

**Defined at**: line 27

## Members

### ClarificationConversation

```ts

export { ClarificationConversation }

```

Re-exported from "./clarification_conversation.js".

**Defined at**: line 8

### ClarificationAnswerURI

```ts

export { ClarificationAnswerURI }

```

Re-exported from "./qanary-types.js".

**Defined at**: line 10

### ClarificationQuestionURI

```ts

export { ClarificationQuestionURI }

```

Re-exported from "./qanary-types.js".

**Defined at**: line 11

### ConversationURI

```ts

export { ConversationURI }

```

Re-exported from "./qanary-types.js".

**Defined at**: line 12

### FinalAnswerURI

```ts

export { FinalAnswerURI }

```

Re-exported from "./qanary-types.js".

**Defined at**: line 13

### QanaryClarificationAnswer

```ts

export { QanaryClarificationAnswer }

```

Re-exported from "./qanary-types.js".

**Defined at**: line 14

### QanaryClarificationQuestion

```ts

export { QanaryClarificationQuestion }

```

Re-exported from "./qanary-types.js".

**Defined at**: line 15

### QanaryFinalAnswer

```ts

export { QanaryFinalAnswer }

```

Re-exported from "./qanary-types.js".

**Defined at**: line 16

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
- `chatbot/state/index`
- [`chatbot/state/qanary-types`](/source-code/chatbot/state/qanary-types)
- [`chatbot/triplestore-service`](/source-code/chatbot/triplestore-service)
- [`chatbot/unit`](/source-code/chatbot/unit)
