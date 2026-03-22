---
title: qanary-component-sparql-generation/get-predefined-sparql
description: Auto-generated source code reference for apps/qanary-component-sparql-generation/src/get-predefined-sparql.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-sparql-generation/get-predefined-sparql`

- Package: `qanary-component-sparql-generation`
- Source file: `apps/qanary-component-sparql-generation/src/get-predefined-sparql.ts`

## Summary

No summary is available for this file.

## Functions

### getSparqlTemplate

```ts

function getSparqlTemplate(relationType: KnownRelationType): string | null

```

**Parameters**
- `relationType` (KnownRelationType)
**Returns**
- `string | null`
**Defined at**: line 138

### getRequiredPlaceholders

```ts

function getRequiredPlaceholders(relationType: KnownRelationType): SparqlPlaceholderName[]

```

**Parameters**
- `relationType` (KnownRelationType)
**Returns**
- `SparqlPlaceholderName[]`
**Defined at**: line 142

## Types

### SparqlPlaceholderName

```ts

type SparqlPlaceholderName = | "district"
  | "species"
  | "street"
  | "streetNumber"
  | "zip"
  | "city"
  | "kitaUrn"
  | "utmAddressCoordinatesX"
  | "utmAddressCoordinatesY"

```

**Defined at**: line 3

## In qanary-component-sparql-generation

- [`qanary-component-sparql-generation/extract-coordinates-from-instances`](/source-code/qanary-component-sparql-generation/extract-coordinates-from-instances)
- [`qanary-component-sparql-generation/get-annotation-information`](/source-code/qanary-component-sparql-generation/get-annotation-information)
- [`qanary-component-sparql-generation/get-coordinates-from-address`](/source-code/qanary-component-sparql-generation/get-coordinates-from-address)
- [`qanary-component-sparql-generation/get-enriched-instances`](/source-code/qanary-component-sparql-generation/get-enriched-instances)
- `qanary-component-sparql-generation/get-predefined-sparql`
- [`qanary-component-sparql-generation/handler`](/source-code/qanary-component-sparql-generation/handler)
- [`qanary-component-sparql-generation/index`](/source-code/qanary-component-sparql-generation)
