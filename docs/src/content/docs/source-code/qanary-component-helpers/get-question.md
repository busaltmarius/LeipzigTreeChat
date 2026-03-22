---
title: qanary-component-helpers/get-question
description: Auto-generated source code reference for packages/qanary-component-helpers/src/get-question.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/get-question`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/get-question.ts`

## Summary

Fetches the raw question from given question url

## Functions

### fetchRawQuestion

```ts

function fetchRawQuestion(questionUrl: string, origin: string): void

```

Fetches the raw question from given question url

**Parameters**
- `questionUrl` (string): the url of the question
- `origin` (string): the origin for the question request, e.g the origin of qanary pipeline
**Defined at**: line 11

### getQuestion

```ts

function getQuestion(message: IQanaryMessage, origin: string): Promise<string | null>

```

Gets the question from the graph given in the message

**Parameters**
- `message` (IQanaryMessage): the message containing the graph and endpoint
- `origin` (string): the origin for the question request, e.g the origin of qanary pipeline
**Returns**
- `Promise<string | null>`: the asked question
**Defined at**: line 33

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
- `qanary-component-helpers/get-question`
- [`qanary-component-helpers/index`](/source-code/qanary-component-helpers)
- [`qanary-component-helpers/interfaces/question-sparql-response`](/source-code/qanary-component-helpers/interfaces/question-sparql-response)
- [`qanary-component-helpers/llm-provider`](/source-code/qanary-component-helpers/llm-provider)
- [`qanary-component-helpers/message-operations`](/source-code/qanary-component-helpers/message-operations)
- [`qanary-component-helpers/query-file-loader`](/source-code/qanary-component-helpers/query-file-loader)
- [`qanary-component-helpers/query-sparql`](/source-code/qanary-component-helpers/query-sparql)
- [`qanary-component-helpers/utils/question-uri-query`](/source-code/qanary-component-helpers/utils/question-uri-query)
