---
title: qanary-component-dis/implementation
description: Auto-generated source code reference for apps/qanary-component-dis/src/implementation.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-dis/implementation`

- Package: `qanary-component-dis`
- Source file: `apps/qanary-component-dis/src/implementation.ts`

## Summary

No summary is available for this file.

## Functions

### fetchNerAnnotations

```ts

function fetchNerAnnotations(message: IQanaryMessage, questionUri: string): Promise<NerAnnotation[]>

```

**Parameters**
- `message` (IQanaryMessage)
- `questionUri` (string)
**Returns**
- `Promise<NerAnnotation[]>`
**Defined at**: line 46

### disambiguate

```ts

function disambiguate(annotation: NerAnnotation): Promise<DisambiguationOutcome>

```

**Parameters**
- `annotation` (NerAnnotation)
**Returns**
- `Promise<DisambiguationOutcome>`
**Defined at**: line 148

### writeDisambiguationAnnotation

```ts

function writeDisambiguationAnnotation(message: IQanaryMessage, annotation: NerAnnotation, result: DisambiguationResult): Promise<void>

```

**Parameters**
- `message` (IQanaryMessage)
- `annotation` (NerAnnotation)
- `result` (DisambiguationResult)
**Returns**
- `Promise<void>`
**Defined at**: line 231

## In qanary-component-dis

- [`qanary-component-dis/entity-types`](/source-code/qanary-component-dis/entity-types)
- [`qanary-component-dis/fuzzy-matching`](/source-code/qanary-component-dis/fuzzy-matching)
- [`qanary-component-dis/handler`](/source-code/qanary-component-dis/handler)
- `qanary-component-dis/implementation`
- [`qanary-component-dis/index`](/source-code/qanary-component-dis)
- [`qanary-component-dis/types`](/source-code/qanary-component-dis/types)
