---
title: qanary-component-helpers/generate-clarification-question
description: Auto-generated source code reference for packages/qanary-component-helpers/src/generate-clarification-question.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/generate-clarification-question`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/generate-clarification-question.ts`

## Summary

Context describing the ambiguity that triggered a clarification request.

## Functions

### generateClarificationQuestion

```ts

function generateClarificationQuestion(context: ClarificationContext, modelFactory: () => LanguageModel, generateFn: GenerateTextFn): Promise<string | null>

```

Uses an LLM to generate a human-readable clarification question based on
the provided ambiguity context.

The generated text is intended to be stored as an
`AnnotationOfClarification` in the Qanary knowledge graph so that the
chatbot can present it to the user.

**Parameters**
- `context` (ClarificationContext): Describes the original question and what is ambiguous.
- `modelFactory` (() => LanguageModel): Optional override for the LLM model factory (for testing / DI).
- `generateFn` (GenerateTextFn): Optional override for the text-generation function.
                     When omitted the function dynamically imports `generateText` from `ai`.
**Returns**
- `Promise<string | null>`: The clarification question string, or `null` if generation fails.
**Defined at**: line 51

## Interfaces

### ClarificationContext

```ts

interface ClarificationContext

```

Context describing the ambiguity that triggered a clarification request.

**Properties**
- `question` (string): The original user question.
- `componentName` (string): The component that encountered the ambiguity.
- `ambiguityDescription` (string): A description of what is ambiguous and why clarification is needed.
**Defined at**: line 7

## Types

### GenerateTextFn

```ts

type GenerateTextFn = (options: {
  model: LanguageModel;
  system: string;
  prompt: string;
}) => Promise<{ text: string }>

```

Signature for a text-generation function compatible with the AI SDK's
`generateText`.  Accepting this as a parameter allows callers (and tests)
to inject their own implementation without having to mock the `ai` module.

**Defined at**: line 21

## In qanary-component-helpers

- [`qanary-component-helpers/api`](../api)
- [`qanary-component-helpers/base`](../base)
- [`qanary-component-helpers/common`](../common)
- [`qanary-component-helpers/configuration`](../configuration)
- [`qanary-component-helpers/create-annotation`](../create-annotation)
- [`qanary-component-helpers/create-clarification-annotation`](../create-clarification-annotation)
- `qanary-component-helpers/generate-clarification-question`
- [`qanary-component-helpers/generate-object-retry`](../generate-object-retry)
- [`qanary-component-helpers/get-domain-instances`](../get-domain-instances)
- [`qanary-component-helpers/get-question-uri`](../get-question-uri)
- [`qanary-component-helpers/get-question`](../get-question)
- [`qanary-component-helpers/index`](..)
- [`qanary-component-helpers/interfaces/question-sparql-response`](../interfaces/question-sparql-response)
- [`qanary-component-helpers/llm-provider`](../llm-provider)
- [`qanary-component-helpers/message-operations`](../message-operations)
- [`qanary-component-helpers/query-file-loader`](../query-file-loader)
- [`qanary-component-helpers/query-sparql`](../query-sparql)
- [`qanary-component-helpers/utils/question-uri-query`](../utils/question-uri-query)
