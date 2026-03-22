---
title: qanary-component-helpers/message-operations
description: Auto-generated source code reference for packages/qanary-component-helpers/src/message-operations.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/message-operations`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/message-operations.ts`

## Summary

Gets the endpoint attribute from the message

## Functions

### getEndpoint

```ts

function getEndpoint(message: QanaryComponentApi.IQanaryMessage): string | undefined

```

Gets the endpoint attribute from the message

**Parameters**
- `message` (QanaryComponentApi.IQanaryMessage): the message received from the qanary pipeline
**Returns**
- `string | undefined`: the endpoint attribute
**Defined at**: line 8

### getInGraph

```ts

function getInGraph(message: QanaryComponentApi.IQanaryMessage): string | undefined

```

Gets the inGraph attribute from the message

**Parameters**
- `message` (QanaryComponentApi.IQanaryMessage): the message received from the qanary pipeline
**Returns**
- `string | undefined`: the inGraph attribute
**Defined at**: line 17

### getOutGraph

```ts

function getOutGraph(message: QanaryComponentApi.IQanaryMessage): string | undefined

```

Gets the outGraph attribute from the message

**Parameters**
- `message` (QanaryComponentApi.IQanaryMessage): the message received from the qanary pipeline
**Returns**
- `string | undefined`: the outGraph attribute
**Defined at**: line 26

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
- [`qanary-component-helpers/get-question-uri`](../get-question-uri)
- [`qanary-component-helpers/get-question`](../get-question)
- [`qanary-component-helpers/index`](..)
- [`qanary-component-helpers/interfaces/question-sparql-response`](../interfaces/question-sparql-response)
- [`qanary-component-helpers/llm-provider`](../llm-provider)
- `qanary-component-helpers/message-operations`
- [`qanary-component-helpers/query-file-loader`](../query-file-loader)
- [`qanary-component-helpers/query-sparql`](../query-sparql)
- [`qanary-component-helpers/utils/question-uri-query`](../utils/question-uri-query)
