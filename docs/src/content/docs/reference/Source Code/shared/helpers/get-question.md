---
title: shared/helpers/get-question
description: Auto-generated source code reference for packages/shared/src/helpers/get-question.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `shared/helpers/get-question`

- Package: `@leipzigtreechat/shared`
- Source file: `packages/shared/src/helpers/get-question.ts`

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
**Defined at**: line 10

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
**Defined at**: line 32

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
- `shared/helpers/get-question`
- [`shared/helpers/message-operations`](../message-operations)
- [`shared/helpers/query-sparql`](../query-sparql)
- [`shared/helpers/question-uri-query`](../question-uri-query)
- [`shared/index`](../..)
- [`shared/interfaces/annotations`](../../interfaces/annotations)
- [`shared/interfaces/qanary-interfaces`](../../interfaces/qanary-interfaces)
- [`shared/interfaces/question-sparql-response copy`](../../interfaces/question-sparql-response copy)
- [`shared/interfaces/question-sparql-response`](../../interfaces/question-sparql-response)
- [`shared/interfaces/representation`](../../interfaces/representation)
- [`shared/maps/annotations`](../../maps/annotations)
