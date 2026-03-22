---
title: shared/helpers/message-operations
description: Auto-generated source code reference for packages/shared/src/helpers/message-operations.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `shared/helpers/message-operations`

- Package: `@leipzigtreechat/shared`
- Source file: `packages/shared/src/helpers/message-operations.ts`

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
- `shared/helpers/message-operations`
- [`shared/helpers/query-sparql`](../query-sparql)
- [`shared/helpers/question-uri-query`](../question-uri-query)
- [`shared/index`](../..)
- [`shared/interfaces/annotations`](../../interfaces/annotations)
- [`shared/interfaces/qanary-interfaces`](../../interfaces/qanary-interfaces)
- [`shared/interfaces/question-sparql-response copy`](../../interfaces/question-sparql-response copy)
- [`shared/interfaces/question-sparql-response`](../../interfaces/question-sparql-response)
- [`shared/interfaces/representation`](../../interfaces/representation)
- [`shared/maps/annotations`](../../maps/annotations)
