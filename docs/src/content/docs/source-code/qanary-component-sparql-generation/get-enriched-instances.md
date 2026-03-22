---
title: qanary-component-sparql-generation/get-enriched-instances
description: Auto-generated source code reference for apps/qanary-component-sparql-generation/src/get-enriched-instances.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-sparql-generation/get-enriched-instances`

- Package: `qanary-component-sparql-generation`
- Source file: `apps/qanary-component-sparql-generation/src/get-enriched-instances.ts`

## Summary

Represents an AnnotationOfInstance enriched with its corresponding type from AnnotationOfSpotInstance

## Functions

### getEnrichedInstances

```ts

function getEnrichedInstances(message: IQanaryMessage): Promise<EnrichedInstance[]>

```

Gets all AnnotationOfInstance annotations with their corresponding types from AnnotationOfSpotInstance
Links them by shared text positions (start/end)

**Parameters**
- `message` (IQanaryMessage): The Qanary message containing endpoint and graph information
**Returns**
- `Promise<EnrichedInstance[]>`: Array of enriched instances with type information
**Defined at**: line 33

## Interfaces

### EnrichedInstance

```ts

interface EnrichedInstance

```

Represents an AnnotationOfInstance enriched with its corresponding type from AnnotationOfSpotInstance

**Properties**
- `instanceUri` (string): The URI of the AnnotationOfInstance
- `entityUrn` (string): The entity URN (body of AnnotationOfInstance)
- `entityType` (string): The entity type from the corresponding AnnotationOfSpotInstance
- `exactQuote` (string): The exact text that was annotated
- `start` (number): Start position in the question text
- `end` (number): End position in the question text
- `instanceConfidence` (number): Confidence score from AnnotationOfInstance
- `spotConfidence` (number): Confidence score from AnnotationOfSpotInstance
**Defined at**: line 7

## In qanary-component-sparql-generation

- [`qanary-component-sparql-generation/extract-coordinates-from-instances`](/source-code/qanary-component-sparql-generation/extract-coordinates-from-instances)
- [`qanary-component-sparql-generation/get-annotation-information`](/source-code/qanary-component-sparql-generation/get-annotation-information)
- [`qanary-component-sparql-generation/get-coordinates-from-address`](/source-code/qanary-component-sparql-generation/get-coordinates-from-address)
- `qanary-component-sparql-generation/get-enriched-instances`
- [`qanary-component-sparql-generation/get-predefined-sparql`](/source-code/qanary-component-sparql-generation/get-predefined-sparql)
- [`qanary-component-sparql-generation/handler`](/source-code/qanary-component-sparql-generation/handler)
- [`qanary-component-sparql-generation/index`](/source-code/qanary-component-sparql-generation)
