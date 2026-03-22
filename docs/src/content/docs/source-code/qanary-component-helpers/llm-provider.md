---
title: qanary-component-helpers/llm-provider
description: Auto-generated source code reference for packages/qanary-component-helpers/src/llm-provider.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/llm-provider`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/llm-provider.ts`

## Summary

Environment variables controlling the LLM backend for all Qanary components:

  OPENROUTER_API_KEY  – API key for OpenRouter (required at call time)
  LLM_MODEL           – model slug understood by OpenRouter
                        (default: "deepseek/deepseek-v3.2")

Swap provider or model at runtime without touching source code — just
change the env vars in your .env file or execution environment.

Security note: the API key is read lazily (only when a model is requested)
and is never stored in a variable that outlives the factory call, mirroring
the spirit of Effect's `Redacted` pattern used in the chatbot package.
It is intentionally never logged or included in error messages.

## Functions

### getLlmModel

```ts

function getLlmModel(): LanguageModel

```

Returns a configured `LanguageModel` instance ready for use with the
Vercel AI SDK (`generateText`, `generateObject`, …).

Throws a descriptive error when `OPENROUTER_API_KEY` is absent so
components fail fast and clearly on misconfiguration rather than producing
cryptic downstream errors.

**Returns**
- `LanguageModel`
**Examples**
```ts
import { getLlmModel } from "@leipzigtreechat/qanary-component-helpers";
import { generateObject } from "ai";

const { object } = await generateObject({
  model: getLlmModel(),
  schema: MySchema,
  prompt: "...",
});

```
**Defined at**: line 42

## Constants

### DEFAULT_MODEL

```ts

const DEFAULT_MODEL: string

```

Environment variables controlling the LLM backend for all Qanary components:

  OPENROUTER_API_KEY  – API key for OpenRouter (required at call time)
  LLM_MODEL           – model slug understood by OpenRouter
                        (default: "deepseek/deepseek-v3.2")

Swap provider or model at runtime without touching source code — just
change the env vars in your .env file or execution environment.

Security note: the API key is read lazily (only when a model is requested)
and is never stored in a variable that outlives the factory call, mirroring
the spirit of Effect's `Redacted` pattern used in the chatbot package.
It is intentionally never logged or included in error messages.

**Defined at**: line 20

## In qanary-component-helpers

- [`qanary-component-helpers/api`](/source-code/qanary-component-helpers/api)
- [`qanary-component-helpers/base`](/source-code/qanary-component-helpers/base)
- [`qanary-component-helpers/common`](/source-code/qanary-component-helpers/common)
- [`qanary-component-helpers/configuration`](/source-code/qanary-component-helpers/configuration)
- [`qanary-component-helpers/create-annotation`](/source-code/qanary-component-helpers/create-annotation)
- [`qanary-component-helpers/create-clarification-annotation`](/source-code/qanary-component-helpers/create-clarification-annotation)
- [`qanary-component-helpers/generate-clarification-question`](/source-code/qanary-component-helpers/generate-clarification-question)
- [`qanary-component-helpers/generate-object-retry`](/source-code/qanary-component-helpers/generate-object-retry)
- [`qanary-component-helpers/get-domain-instances`](/source-code/qanary-component-helpers/get-domain-instances)
- [`qanary-component-helpers/get-question-uri`](/source-code/qanary-component-helpers/get-question-uri)
- [`qanary-component-helpers/get-question`](/source-code/qanary-component-helpers/get-question)
- [`qanary-component-helpers/index`](/source-code/qanary-component-helpers)
- [`qanary-component-helpers/interfaces/question-sparql-response`](/source-code/qanary-component-helpers/interfaces/question-sparql-response)
- `qanary-component-helpers/llm-provider`
- [`qanary-component-helpers/message-operations`](/source-code/qanary-component-helpers/message-operations)
- [`qanary-component-helpers/query-file-loader`](/source-code/qanary-component-helpers/query-file-loader)
- [`qanary-component-helpers/query-sparql`](/source-code/qanary-component-helpers/query-sparql)
- [`qanary-component-helpers/utils/question-uri-query`](/source-code/qanary-component-helpers/utils/question-uri-query)
