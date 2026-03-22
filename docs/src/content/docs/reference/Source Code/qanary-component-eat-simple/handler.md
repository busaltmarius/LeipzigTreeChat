---
title: qanary-component-eat-simple/handler
description: Auto-generated source code reference for apps/qanary-component-eat-simple/src/handler.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-eat-simple/handler`

- Package: `qanary-component-eat-simple`
- Source file: `apps/qanary-component-eat-simple/src/handler.ts`

## Summary

Confidence threshold below which a clarification question is generated
even though the classification result is still written to the graph.

## Functions

### handler

```ts

function handler(message: IQanaryMessage): void

```

An event handler for incoming messages of the Qanary pipeline
Exported only for testing purposes

**Parameters**
- `message` (IQanaryMessage): incoming qanary pipeline message
**Defined at**: line 24

### writeClarification

```ts

function writeClarification(message: IQanaryMessage, question: string, ambiguity: { reason: string; detail: string }): Promise<void>

```

Generates an LLM-based clarification question and writes it as an
`AnnotationOfClarification` into the Qanary knowledge graph.

**Parameters**
- `message` (IQanaryMessage)
- `question` (string)
- `ambiguity` ({ reason: string; detail: string })
**Returns**
- `Promise<void>`
**Defined at**: line 88

### getExpectedEntityType

```ts

function getExpectedEntityType(question: string): Promise<URL | null>

```

Returns the EAT URL for a given question using the LLM classifier.
Exported for testing purposes.

**Parameters**
- `question` (string)
**Returns**
- `Promise<URL | null>`
**Defined at**: line 116

## Constants

### CLARIFICATION_CONFIDENCE_THRESHOLD

```ts

const CLARIFICATION_CONFIDENCE_THRESHOLD: number

```

Confidence threshold below which a clarification question is generated
even though the classification result is still written to the graph.

**Defined at**: line 17

## In qanary-component-eat-simple

- [`qanary-component-eat-simple/eat-classifier`](../eat-classifier)
- `qanary-component-eat-simple/handler`
- [`qanary-component-eat-simple/index`](..)
