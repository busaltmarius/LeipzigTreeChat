---
title: qanary-component-helpers/get-question-uri
description: Auto-generated source code reference for packages/qanary-component-helpers/src/get-question-uri.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/get-question-uri`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/get-question-uri.ts`

## Summary

Gets the question uri from the graph given in the message

## Functions

### getQuestionUri

```ts

function getQuestionUri(message: IQanaryMessage): Promise<string | null>

```

Gets the question uri from the graph given in the message

**Parameters**
- `message` (IQanaryMessage): the message containing the graph and endpoint
**Returns**
- `Promise<string | null>`: the uri of the question
**Defined at**: line 13

## In qanary-component-helpers

- [`qanary-component-helpers/api`](../api)
- [`qanary-component-helpers/base`](../base)
- [`qanary-component-helpers/common`](../common)
- [`qanary-component-helpers/configuration`](../configuration)
- [`qanary-component-helpers/create-annotation`](../create-annotation)
- [`qanary-component-helpers/create-clarification-annotation`](../create-clarification-annotation)
- [`qanary-component-helpers/generate-clarification-question`](../generate-clarification-question)
- [`qanary-component-helpers/generate-object-retry`](../generate-object-retry)
- [`qanary-component-helpers/get-domain-instances`](../get-domain-instances)
- `qanary-component-helpers/get-question-uri`
- [`qanary-component-helpers/get-question`](../get-question)
- [`qanary-component-helpers/index`](..)
- [`qanary-component-helpers/interfaces/question-sparql-response`](../interfaces/question-sparql-response)
- [`qanary-component-helpers/llm-provider`](../llm-provider)
- [`qanary-component-helpers/message-operations`](../message-operations)
- [`qanary-component-helpers/query-file-loader`](../query-file-loader)
- [`qanary-component-helpers/query-sparql`](../query-sparql)
- [`qanary-component-helpers/utils/question-uri-query`](../utils/question-uri-query)
