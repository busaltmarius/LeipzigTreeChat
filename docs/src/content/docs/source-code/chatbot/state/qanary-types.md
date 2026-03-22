---
title: chatbot/state/qanary-types
description: Auto-generated source code reference for packages/chatbot/src/state/qanary-types.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/state/qanary-types`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/state/qanary-types.ts`

## Summary

Identifies a question within a conversation.

## Classes

### ClarificationQuestionURI

```ts

class ClarificationQuestionURI extends Data.TaggedClass("ClarificationQuestionURI")<{ value: string }>

```

Identifies a question within a conversation.

**Extends**: `Data.TaggedClass("ClarificationQuestionURI")<{ value: string }>`
**Methods**
- `constructor(value: string)`: Creates a new `QuestionURI` with the given value.
**Defined at**: line 6

### ConversationURI

```ts

class ConversationURI extends Data.TaggedClass("ConversationURI")<{ value: string }>

```

Identifies a conversation instance.

**Extends**: `Data.TaggedClass("ConversationURI")<{ value: string }>`
**Methods**
- `constructor(value: string)`: Creates a new `ConversationURI` with the given value.
**Defined at**: line 20

### ClarificationAnswerURI

```ts

class ClarificationAnswerURI extends Data.TaggedClass("ClarificationAnswerURI")<{ value: string }>

```

Identifies a clarification answer within a conversation.

**Extends**: `Data.TaggedClass("ClarificationAnswerURI")<{ value: string }>`
**Methods**
- `constructor(value: string)`: Creates a new `ClarificationAnswerURI` with the given value.
**Defined at**: line 34

### FinalAnswerURI

```ts

class FinalAnswerURI extends Data.TaggedClass("FinalAnswerURI")<{ value: string }>

```

Identifies a final answer within a conversation.

**Extends**: `Data.TaggedClass("FinalAnswerURI")<{ value: string }>`
**Methods**
- `constructor(value: string)`: Creates a new `FinalAnswerURI` with the given value.
**Defined at**: line 48

### QanaryClarificationQuestion

```ts

class QanaryClarificationQuestion extends Data.TaggedClass("QanaryClarificationQuestion")<{
  /**
   * Stable identifier for the question.
   */
  uri: ClarificationQuestionURI;

  /**
   * User-facing question text.
   */
  content: string;
}>

```

A clarification question asked by the chatbot.

**Extends**: `Data.TaggedClass("QanaryClarificationQuestion")<{
  /**
   * Stable identifier for the question.
   */
  uri: ClarificationQuestionURI;

  /**
   * User-facing question text.
   */
  content: string;
}>`
**Methods**
- `constructor(uri: ClarificationQuestionURI, content: string)`: Creates a new clarification question.
**Defined at**: line 62

### QanaryClarificationAnswer

```ts

class QanaryClarificationAnswer extends Data.TaggedClass("QanaryClarificationAnswer")<{
  /**
   * Stable identifier for the answer. Is null for answers that are not yet stored in the triplestore.
   */
  uri: ClarificationAnswerURI | null;

  /**
   * User-facing answer text.
   */
  content: string;
}>

```

A user-provided answer to a clarification question.

**Extends**: `Data.TaggedClass("QanaryClarificationAnswer")<{
  /**
   * Stable identifier for the answer. Is null for answers that are not yet stored in the triplestore.
   */
  uri: ClarificationAnswerURI | null;

  /**
   * User-facing answer text.
   */
  content: string;
}>`
**Methods**
- `constructor(uri: ClarificationAnswerURI | null, content: string)`: Creates a new clarification answer.
**Defined at**: line 87

### QanaryFinalAnswer

```ts

class QanaryFinalAnswer extends Data.TaggedClass("QanaryFinalAnswer")<{
  /**
   * Stable identifier for the final answer.
   */
  uri: FinalAnswerURI;

  /**
   * User-facing final answer text.
   */
  content: string;
}>

```

A final answer returned by the chatbot.

**Extends**: `Data.TaggedClass("QanaryFinalAnswer")<{
  /**
   * Stable identifier for the final answer.
   */
  uri: FinalAnswerURI;

  /**
   * User-facing final answer text.
   */
  content: string;
}>`
**Methods**
- `constructor(uri: FinalAnswerURI, content: string)`: Creates a new final answer.
**Defined at**: line 112

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
- `chatbot/state/qanary-types`
- [`chatbot/triplestore-service`](/source-code/chatbot/triplestore-service)
- [`chatbot/unit`](/source-code/chatbot/unit)
