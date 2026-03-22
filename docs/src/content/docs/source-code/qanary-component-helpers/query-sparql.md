---
title: qanary-component-helpers/query-sparql
description: Auto-generated source code reference for packages/qanary-component-helpers/src/query-sparql.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/query-sparql`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/query-sparql.ts`

## Summary

Transforms a stream to a promise

## Functions

### streamToPromise

```ts

function streamToPromise(stream: internal.Readable): Promise<Array<T>>

```

Transforms a stream to a promise

**Parameters**
- `stream` (internal.Readable): the stream to transform
**Returns**
- `Promise<Array<T>>`: the result of the stream as a promise
**Defined at**: line 9

### selectSparql

```ts

function selectSparql(endpointUrl: string, query: string): Promise<Array<T>>

```

Queries a sparql endpoint with the given select query

**Parameters**
- `endpointUrl` (string): the sparql endpoint to query
- `query` (string): the select query to execute
**Returns**
- `Promise<Array<T>>`: the result of the query
**Defined at**: line 28

### askSparql

```ts

function askSparql(endpointUrl: string, query: string): Promise<boolean>

```

Queries a sparql endpoint with the given ask query

**Parameters**
- `endpointUrl` (string): the sparql endpoint to query
- `query` (string): the ask query to execute
**Returns**
- `Promise<boolean>`: the result of the query
**Defined at**: line 41

### updateSparql

```ts

function updateSparql(endpointUrl: string, query: string): Promise<void>

```

Queries a sparql endpoint with the given update query

**Parameters**
- `endpointUrl` (string): the sparql endpoint to query
- `query` (string): the update query to execute
**Returns**
- `Promise<void>`
**Defined at**: line 52

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
- [`qanary-component-helpers/llm-provider`](/source-code/qanary-component-helpers/llm-provider)
- [`qanary-component-helpers/message-operations`](/source-code/qanary-component-helpers/message-operations)
- [`qanary-component-helpers/query-file-loader`](/source-code/qanary-component-helpers/query-file-loader)
- `qanary-component-helpers/query-sparql`
- [`qanary-component-helpers/utils/question-uri-query`](/source-code/qanary-component-helpers/utils/question-uri-query)
