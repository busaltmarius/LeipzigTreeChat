---
title: qanary-component-dis/types
description: Auto-generated source code reference for apps/qanary-component-dis/src/types.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-dis/types`

- Package: `qanary-component-dis`
- Source file: `apps/qanary-component-dis/src/types.ts`

## Summary

NER annotation from the knowledge graph

## Interfaces

### NerAnnotation

```ts

interface NerAnnotation

```

NER annotation from the knowledge graph

**Properties**
- `annotationUri` (string)
- `spotResourceUri` (string)
- `entityType` (string)
- `score` (number)
- `exactQuote` (string)
- `start` (number)
- `end` (number)
- `questionUri` (string)
**Defined at**: line 6

### DisambiguationResult

```ts

interface DisambiguationResult

```

Disambiguation result with matched entity

**Properties**
- `entityUrn` (string)
- `score` (number)
- `label` (string)
**Defined at**: line 20

### DisambiguationOutcome

```ts

interface DisambiguationOutcome

```

Outcome of a disambiguation attempt, including all candidates above threshold.

**Properties**
- `result` (DisambiguationResult | null): The best match, or null if no candidates met the threshold.
- `candidates` (DisambiguationResult[]): All candidates that met the fuzzy threshold, sorted by similarity descending.
**Defined at**: line 29

### SparqlBinding

```ts

interface SparqlBinding

```

SPARQL binding result interface

**Defined at**: line 39

## In qanary-component-dis

- [`qanary-component-dis/entity-types`](/source-code/qanary-component-dis/entity-types)
- [`qanary-component-dis/fuzzy-matching`](/source-code/qanary-component-dis/fuzzy-matching)
- [`qanary-component-dis/handler`](/source-code/qanary-component-dis/handler)
- [`qanary-component-dis/implementation`](/source-code/qanary-component-dis/implementation)
- [`qanary-component-dis/index`](/source-code/qanary-component-dis)
- `qanary-component-dis/types`
