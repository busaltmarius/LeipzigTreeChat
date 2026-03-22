---
title: qanary-component-sparql-generation/get-annotation-information
description: Auto-generated source code reference for apps/qanary-component-sparql-generation/src/get-annotation-information.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-sparql-generation/get-annotation-information`

- Package: `qanary-component-sparql-generation`
- Source file: `apps/qanary-component-sparql-generation/src/get-annotation-information.ts`

## Summary

Represents an AnnotationOfInstance enriched with its corresponding type from AnnotationOfSpotInstance

## Functions

### isValidRelationType

```ts

function isValidRelationType(relationType: string): relationType is KnownRelationType

```

Checks if a string is a valid relation type

**Parameters**
- `relationType` (string)
**Returns**
- `relationType is KnownRelationType`
**Defined at**: line 45

### getRelationType

```ts

function getRelationType(message: IQanaryMessage): Promise<KnownRelationType | "">

```

Gets the relation type from AnnotationOfRelation

**Parameters**
- `message` (IQanaryMessage): The Qanary message containing endpoint and graph information
**Returns**
- `Promise<KnownRelationType | "">`: The validated relation type, or empty string if not found or invalid
**Defined at**: line 55

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
**Defined at**: line 109

### getAnnotationInformation

```ts

function getAnnotationInformation(message: IQanaryMessage): Promise<AnnotationInformation>

```

Gets all required annotation information: relation type and instances with their types

**Parameters**
- `message` (IQanaryMessage): The Qanary message containing endpoint and graph information
**Returns**
- `Promise<AnnotationInformation>`: Annotation information including relation type and enriched instances
**Defined at**: line 209

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
**Defined at**: line 13

### AnnotationInformation

```ts

interface AnnotationInformation

```

All annotation information required for SPARQL generation

**Properties**
- `relationType` (KnownRelationType | ""): The detected and validated relation type
- `instances` (EnrichedInstance[]): All instances with their corresponding entity types
**Defined at**: line 35

## In qanary-component-sparql-generation

- [`qanary-component-sparql-generation/extract-coordinates-from-instances`](../extract-coordinates-from-instances)
- `qanary-component-sparql-generation/get-annotation-information`
- [`qanary-component-sparql-generation/get-coordinates-from-address`](../get-coordinates-from-address)
- [`qanary-component-sparql-generation/get-enriched-instances`](../get-enriched-instances)
- [`qanary-component-sparql-generation/get-predefined-sparql`](../get-predefined-sparql)
- [`qanary-component-sparql-generation/handler`](../handler)
- [`qanary-component-sparql-generation/index`](..)
