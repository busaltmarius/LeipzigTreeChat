---
title: qanary-component-sparql-generation/extract-coordinates-from-instances
description: Auto-generated source code reference for apps/qanary-component-sparql-generation/src/extract-coordinates-from-instances.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-sparql-generation/extract-coordinates-from-instances`

- Package: `qanary-component-sparql-generation`
- Source file: `apps/qanary-component-sparql-generation/src/extract-coordinates-from-instances.ts`

## Summary

Extracts address components (street, street number, zip) from enriched instances

## Functions

### extractAddressComponents

```ts

function extractAddressComponents(instances: EnrichedInstance[]): AddressComponents

```

Extracts address components (street, street number, zip) from enriched instances

**Parameters**
- `instances` (EnrichedInstance[]): Array of enriched instances
**Returns**
- `AddressComponents`: Object with extracted address components
**Defined at**: line 16

### buildAddressString

```ts

function buildAddressString(components: AddressComponents): string | null

```

Builds a complete address string from address components

**Parameters**
- `components` (AddressComponents): Address components
**Returns**
- `string | null`: Formatted address string, or null if no meaningful components found
**Defined at**: line 42

### extractCoordinatesFromInstances

```ts

function extractCoordinatesFromInstances(instances: EnrichedInstance[]): Promise<Coordinates | null>

```

Extracts coordinates from street/street number/zip information in instances

**Parameters**
- `instances` (EnrichedInstance[]): Array of enriched instances
**Returns**
- `Promise<Coordinates | null>`: Coordinates if address components found, null otherwise
**Defined at**: line 76

## In qanary-component-sparql-generation

- `qanary-component-sparql-generation/extract-coordinates-from-instances`
- [`qanary-component-sparql-generation/get-annotation-information`](/source-code/qanary-component-sparql-generation/get-annotation-information)
- [`qanary-component-sparql-generation/get-coordinates-from-address`](/source-code/qanary-component-sparql-generation/get-coordinates-from-address)
- [`qanary-component-sparql-generation/get-enriched-instances`](/source-code/qanary-component-sparql-generation/get-enriched-instances)
- [`qanary-component-sparql-generation/get-predefined-sparql`](/source-code/qanary-component-sparql-generation/get-predefined-sparql)
- [`qanary-component-sparql-generation/handler`](/source-code/qanary-component-sparql-generation/handler)
- [`qanary-component-sparql-generation/index`](/source-code/qanary-component-sparql-generation)
