---
title: chatbot/state/clarification_conversation
description: Auto-generated source code reference for packages/chatbot/src/state/clarification_conversation.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatbot/state/clarification_conversation`

- Package: `@leipzigtreechat/chatbot`
- Source file: `packages/chatbot/src/state/clarification_conversation.ts`

## Summary

Stores clarification questions from the chatbot to the user and the answers provided by the user.

## Classes

### ClarificationConversation

```ts

class ClarificationConversation extends Data.TaggedClass("Conversation")<{
  uri: ConversationURI;
  _questions: MutableHashMap.MutableHashMap<ClarificationQuestionURI, QanaryClarificationQuestion>;
  _openQuestions: MutableHashSet.MutableHashSet<ClarificationQuestionURI>;
  _resolvedQuestions: MutableHashMap.MutableHashMap<ClarificationQuestionURI, QanaryClarificationAnswer>;
}>

```

Stores clarification questions from the chatbot to the user and the answers provided by the user.

**Extends**: `Data.TaggedClass("Conversation")<{
  uri: ConversationURI;
  _questions: MutableHashMap.MutableHashMap<ClarificationQuestionURI, QanaryClarificationQuestion>;
  _openQuestions: MutableHashSet.MutableHashSet<ClarificationQuestionURI>;
  _resolvedQuestions: MutableHashMap.MutableHashMap<ClarificationQuestionURI, QanaryClarificationAnswer>;
}>`
**Properties**
- `_currentQuestionUri` (ClarificationQuestionURI | null): Identifier of the question currently being answered, if one has been selected.
**Methods**
- `constructor(uri: ConversationURI)`: Creates an empty conversation for the given identifier.
- `addQuestion(question: QanaryClarificationQuestion): void`: Registers a new question and marks it as open.
- `hasQuestion(questionUri: ClarificationQuestionURI): boolean`: Checks whether the conversation has a question with the given URI.
- `setCurrentQuestion(questionUri: ClarificationQuestionURI): void`: Marks a known question as the current question being answered.
- `hasCurrentQuestion(): boolean`: Checks whether there is a current question being answered.
- `answerCurrentQuestion(answer: QanaryClarificationAnswer): void`: Stores an answer for the current question and removes the question from the open set.
- `hasAnswer(questionUri: ClarificationQuestionURI): boolean`: Returns whether the given question already has a recorded answer.
- `hasOpenQuestions(): boolean`: Returns whether the conversation still contains unanswered questions.
- `resolvedQuestions(): { question: QanaryClarificationQuestion; answer: QanaryClarificationAnswer }[]`: Returns all resolved question-answer pairs.
- `openQuestions(): QanaryClarificationQuestion[]`: Returns all currently unanswered questions.
- `getFirstOpenQuestion(): QanaryClarificationQuestion | undefined`: Returns the first unanswered question.
**Defined at**: line 12

## In chatbot

- [`chatbot/constants`](../../constants)
- [`chatbot/errors`](../../errors)
- [`chatbot/graph`](../../graph)
- [`chatbot/index`](../..)
- [`chatbot/langgraph-runtime`](../../langgraph-runtime)
- [`chatbot/llm-service`](../../llm-service)
- [`chatbot/metadata`](../../metadata)
- [`chatbot/nodes`](../../nodes)
- `chatbot/state/clarification_conversation`
- [`chatbot/state/index`](..)
- [`chatbot/state/qanary-types`](../qanary-types)
- [`chatbot/triplestore-service`](../../triplestore-service)
- [`chatbot/unit`](../../unit)
