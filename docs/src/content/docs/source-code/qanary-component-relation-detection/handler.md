---
title: qanary-component-relation-detection/handler
description: Auto-generated source code reference for apps/qanary-component-relation-detection/src/handler.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-relation-detection/handler`

- Package: `qanary-component-relation-detection`
- Source file: `apps/qanary-component-relation-detection/src/handler.ts`

## Summary

Confidence threshold below which a clarification question is generated.

## Functions

### handler

```ts

function handler(message: IQanaryMessage): void

```

An event handler for incoming messages of the Qanary pipeline
Exported only for testing purposes

**Parameters**
- `message` (IQanaryMessage): incoming qanary pipeline message
**Defined at**: line 26

### writeClarificationIfNeeded

```ts

function writeClarificationIfNeeded(message: IQanaryMessage, question: string, ambiguityDescription: string): Promise<void>

```

Generates a clarification question via the LLM and writes it as an
`AnnotationOfClarification` into the knowledge graph.

**Parameters**
- `message` (IQanaryMessage)
- `question` (string)
- `ambiguityDescription` (string)
**Returns**
- `Promise<void>`
**Defined at**: line 84

## Constants

### CLARIFICATION_CONFIDENCE_THRESHOLD

```ts

const CLARIFICATION_CONFIDENCE_THRESHOLD: number

```

Confidence threshold below which a clarification question is generated.

**Defined at**: line 18

## In qanary-component-relation-detection

- `qanary-component-relation-detection/handler`
- [`qanary-component-relation-detection/index`](/source-code/qanary-component-relation-detection)
- [`qanary-component-relation-detection/relation-classifier`](/source-code/qanary-component-relation-detection/relation-classifier)
- [`qanary-component-relation-detection/relation-types`](/source-code/qanary-component-relation-detection/relation-types)
