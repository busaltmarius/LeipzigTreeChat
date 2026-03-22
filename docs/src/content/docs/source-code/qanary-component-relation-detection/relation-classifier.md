---
title: qanary-component-relation-detection/relation-classifier
description: Auto-generated source code reference for apps/qanary-component-relation-detection/src/relation-classifier.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-relation-detection/relation-classifier`

- Package: `qanary-component-relation-detection`
- Source file: `apps/qanary-component-relation-detection/src/relation-classifier.ts`

## Summary

Re-exported from "./relation-types.ts".

## Functions

### classifyRelationType

```ts

function classifyRelationType(question: string, modelFactory: () => ReturnType<typeof getLlmModel>): Promise<RelationClassification | null>

```

**Parameters**
- `question` (string)
- `modelFactory` (() => ReturnType<typeof getLlmModel>)
**Returns**
- `Promise<RelationClassification | null>`
**Defined at**: line 64

## Interfaces

### RelationClassification

```ts

interface RelationClassification

```

**Properties**
- `relationType` (KnownRelationType)
- `confidence` (number)
**Defined at**: line 27

## Constants

### KNOWN_RELATION_TYPES_OLD

```ts

const KNOWN_RELATION_TYPES_OLD: unknown

```

**Defined at**: line 8

## Members

### getRelationTypeExplanation

```ts

export { getRelationTypeExplanation }

```

Re-exported from "./relation-types.ts".

**Defined at**: line 6

### KNOWN_RELATION_TYPES

```ts

export { KNOWN_RELATION_TYPES }

```

Re-exported from "./relation-types.ts".

**Defined at**: line 6

### KnownRelationType

```ts

export { type KnownRelationType }

```

Re-exported from "./relation-types.ts".

**Defined at**: line 6

## In qanary-component-relation-detection

- [`qanary-component-relation-detection/handler`](/source-code/qanary-component-relation-detection/handler)
- [`qanary-component-relation-detection/index`](/source-code/qanary-component-relation-detection)
- `qanary-component-relation-detection/relation-classifier`
- [`qanary-component-relation-detection/relation-types`](/source-code/qanary-component-relation-detection/relation-types)
