---
title: qanary-component-nerd-simple/nerd-classifier
description: Auto-generated source code reference for apps/qanary-component-nerd-simple/src/nerd-classifier.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-nerd-simple/nerd-classifier`

- Package: `qanary-component-nerd-simple`
- Source file: `apps/qanary-component-nerd-simple/src/nerd-classifier.ts`

## Summary

Predefined entity types for the knowledge-graph QA pipeline.
These map directly to SPARQL query patterns on the tree knowledge base.

The list is intentionally open — the LLM may return any string for types
that don't fit a predefined category. The predefined values serve as
strong hints so the model uses consistent, query-friendly labels.

## Functions

### correctEntityOffsets

```ts

function correctEntityOffsets(entity: NerdEntity, question: string): NerdEntity | null

```

Attempts to fix a single entity whose character offsets do not match the
question text.

Algorithm:
 1. Find every occurrence of `entity.entity` (verbatim) in the question.
 2. Pick the occurrence whose start index is closest to the originally
    reported `entity.start` (handles rare cases where the same substring
    appears more than once).
 3. Return a new entity object with corrected start/end, or `null` when
    the entity text cannot be found anywhere in the question.

This repairs a known failure mode of some LLMs (e.g. deepseek-v3.2 via
OpenRouter) that return the correct entity text but wrong character offsets.

**Parameters**
- `entity` (NerdEntity)
- `question` (string)
**Returns**
- `NerdEntity | null`
**Defined at**: line 152

### sanitiseEntities

```ts

function sanitiseEntities(entities: NerdEntity[], question: string): NerdEntity[]

```

Validates and (where possible) repairs the character offsets of every
entity returned by the LLM.

- Entities whose offsets already match are passed through unchanged.
- Entities with wrong offsets are auto-corrected if the entity text can be
  found in the question.
- Entities whose text does not appear anywhere in the question are dropped.

**Parameters**
- `entities` (NerdEntity[])
- `question` (string)
**Returns**
- `NerdEntity[]`
**Defined at**: line 192

### detectAndRecogniseEntities

```ts

function detectAndRecogniseEntities(question: string, modelFactory: () => ReturnType<typeof getLlmModel>): Promise<NerdResponse | null>

```

Calls the LLM to detect and recognise all named entities in a question.

Uses  which transparently handles two common
LLM failure modes:
 - JSON wrapped in markdown code fences (e.g. claude-3.5-haiku via OpenRouter)
 - Up to 3 total LLM calls on parse failures

Additionally, entity offsets that are wrong but recoverable (entity text
found elsewhere in the question) are auto-corrected rather than dropped.

**Parameters**
- `question` (string): The natural-language question to analyse.
- `modelFactory` (() => ReturnType<typeof getLlmModel>): Optional model factory override — used in tests to
                      avoid calling a real LLM. Defaults to `getLlmModel`.
**Returns**
- `Promise<NerdResponse | null>`: Detected entities with their types and char offsets,
                      or `null` if the LLM call fails.
**Defined at**: line 244

## Interfaces

### NerdEntity

```ts

interface NerdEntity

```

A single detected and recognised entity.

**Properties**
- `entity` (string): The verbatim text span extracted from the question
- `type` (string): The entity type.
Should be one of the predefined KNOWN_ENTITY_TYPES where possible,
but may be any uppercase string for unknown categories.
- `start` (number): 0-based character index of the first character of the entity span
- `end` (number): 0-based character index one past the last character of the entity span
- `confidence` (number): Model confidence for this entity, in [0, 1]
**Defined at**: line 30

### NerdResponse

```ts

interface NerdResponse

```

Full response from the LLM classifier.

**Properties**
- `entities` (NerdEntity[])
**Defined at**: line 50

## Types

### KnownEntityType

```ts

type KnownEntityType = (typeof KNOWN_ENTITY_TYPES)[number]

```

**Defined at**: line 25

## Constants

### KNOWN_ENTITY_TYPES

```ts

const KNOWN_ENTITY_TYPES: unknown

```

Predefined entity types for the knowledge-graph QA pipeline.
These map directly to SPARQL query patterns on the tree knowledge base.

The list is intentionally open — the LLM may return any string for types
that don't fit a predefined category. The predefined values serve as
strong hints so the model uses consistent, query-friendly labels.

**Defined at**: line 12

## In qanary-component-nerd-simple

- [`qanary-component-nerd-simple/handler`](../handler)
- [`qanary-component-nerd-simple/index`](..)
- `qanary-component-nerd-simple/nerd-classifier`
