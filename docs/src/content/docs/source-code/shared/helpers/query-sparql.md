---
title: shared/helpers/query-sparql
description: Auto-generated source code reference for packages/shared/src/helpers/query-sparql.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `shared/helpers/query-sparql`

- Package: `@leipzigtreechat/shared`
- Source file: `packages/shared/src/helpers/query-sparql.ts`

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

## In shared

- [`shared/constants/qanary`](/source-code/shared/constants/qanary)
- [`shared/enums/annotations`](/source-code/shared/enums/annotations)
- [`shared/enums/calculation`](/source-code/shared/enums/calculation)
- [`shared/enums/component-list`](/source-code/shared/enums/component-list)
- [`shared/enums/domains`](/source-code/shared/enums/domains)
- [`shared/enums/intents`](/source-code/shared/enums/intents)
- [`shared/enums/rasa-response-types`](/source-code/shared/enums/rasa-response-types)
- [`shared/enums/representation`](/source-code/shared/enums/representation)
- [`shared/helpers/create-annotation`](/source-code/shared/helpers/create-annotation)
- [`shared/helpers/get-question-uri`](/source-code/shared/helpers/get-question-uri)
- [`shared/helpers/get-question`](/source-code/shared/helpers/get-question)
- [`shared/helpers/message-operations`](/source-code/shared/helpers/message-operations)
- `shared/helpers/query-sparql`
- [`shared/helpers/question-uri-query`](/source-code/shared/helpers/question-uri-query)
- [`shared/index`](/source-code/shared)
- [`shared/interfaces/annotations`](/source-code/shared/interfaces/annotations)
- [`shared/interfaces/qanary-interfaces`](/source-code/shared/interfaces/qanary-interfaces)
- [`shared/interfaces/question-sparql-response copy`](/source-code/shared/interfaces/question-sparql-response copy)
- [`shared/interfaces/question-sparql-response`](/source-code/shared/interfaces/question-sparql-response)
- [`shared/interfaces/representation`](/source-code/shared/interfaces/representation)
- [`shared/maps/annotations`](/source-code/shared/maps/annotations)
