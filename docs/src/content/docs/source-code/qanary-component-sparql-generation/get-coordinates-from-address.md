---
title: qanary-component-sparql-generation/get-coordinates-from-address
description: Auto-generated source code reference for apps/qanary-component-sparql-generation/src/get-coordinates-from-address.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-sparql-generation/get-coordinates-from-address`

- Package: `qanary-component-sparql-generation`
- Source file: `apps/qanary-component-sparql-generation/src/get-coordinates-from-address.ts`

## Summary

Loads the cache from the JSON text file.

## Functions

### loadCache

```ts

function loadCache(): Promise<Record<string, Coordinates>>

```

Loads the cache from the JSON text file.

**Returns**
- `Promise<Record<string, Coordinates>>`
**Defined at**: line 29

### saveCache

```ts

function saveCache(): void

```

Saves the memory cache back to the JSON text file.

**Defined at**: line 44

### getCoordinatesFromAddress

```ts

function getCoordinatesFromAddress(address: string): Promise<Coordinates | null>

```

Translates a street address to geographic coordinates (latitude, longitude)
Includes a local JSON cache and a strict 1.1s rate limiter queue.
*

**Parameters**
- `address` (string): The street address to geocode
**Returns**
- `Promise<Coordinates | null>`: Coordinates with latitude and longitude, or null if not found
**Defined at**: line 59

## Interfaces

### Coordinates

```ts

interface Coordinates

```

**Properties**
- `latitude` (number)
- `longitude` (number)
**Defined at**: line 4

## In qanary-component-sparql-generation

- [`qanary-component-sparql-generation/extract-coordinates-from-instances`](/source-code/qanary-component-sparql-generation/extract-coordinates-from-instances)
- [`qanary-component-sparql-generation/get-annotation-information`](/source-code/qanary-component-sparql-generation/get-annotation-information)
- `qanary-component-sparql-generation/get-coordinates-from-address`
- [`qanary-component-sparql-generation/get-enriched-instances`](/source-code/qanary-component-sparql-generation/get-enriched-instances)
- [`qanary-component-sparql-generation/get-predefined-sparql`](/source-code/qanary-component-sparql-generation/get-predefined-sparql)
- [`qanary-component-sparql-generation/handler`](/source-code/qanary-component-sparql-generation/handler)
- [`qanary-component-sparql-generation/index`](/source-code/qanary-component-sparql-generation)
