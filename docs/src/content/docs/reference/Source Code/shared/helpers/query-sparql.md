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

- [`shared/constants/qanary`](../../constants/qanary)
- [`shared/enums/annotations`](../../enums/annotations)
- [`shared/enums/calculation`](../../enums/calculation)
- [`shared/enums/component-list`](../../enums/component-list)
- [`shared/enums/domains`](../../enums/domains)
- [`shared/enums/intents`](../../enums/intents)
- [`shared/enums/rasa-response-types`](../../enums/rasa-response-types)
- [`shared/enums/representation`](../../enums/representation)
- [`shared/helpers/create-annotation`](../create-annotation)
- [`shared/helpers/get-question-uri`](../get-question-uri)
- [`shared/helpers/get-question`](../get-question)
- [`shared/helpers/message-operations`](../message-operations)
- `shared/helpers/query-sparql`
- [`shared/helpers/question-uri-query`](../question-uri-query)
- [`shared/index`](../..)
- [`shared/interfaces/annotations`](../../interfaces/annotations)
- [`shared/interfaces/qanary-interfaces`](../../interfaces/qanary-interfaces)
- [`shared/interfaces/question-sparql-response copy`](../../interfaces/question-sparql-response copy)
- [`shared/interfaces/question-sparql-response`](../../interfaces/question-sparql-response)
- [`shared/interfaces/representation`](../../interfaces/representation)
- [`shared/maps/annotations`](../../maps/annotations)
