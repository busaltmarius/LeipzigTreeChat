---
title: qanary-component-dis/entity-types
description: Auto-generated source code reference for apps/qanary-component-dis/src/entity-types.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-dis/entity-types`

- Package: `qanary-component-dis`
- Source file: `apps/qanary-component-dis/src/entity-types.ts`

## Summary

Supported entity types for disambiguation

## Functions

### extractEntityTypeFromUri

```ts

function extractEntityTypeFromUri(entityTypeUri: string): EntityType | null

```

**Parameters**
- `entityTypeUri` (string)
**Returns**
- `EntityType | null`
**Defined at**: line 62

### getEntityTypeConfig

```ts

function getEntityTypeConfig(entityType: EntityType): EntityTypeConfig

```

**Parameters**
- `entityType` (EntityType)
**Returns**
- `EntityTypeConfig`
**Defined at**: line 79

### generateEntityQuery

```ts

function generateEntityQuery(entityType: EntityType): string

```

export function isSupportedEntityType(entityTypeUri: string): boolean 
  const extractedType = extractEntityTypeFromUri(entityTypeUri);
  return extractedType !== null;

**Parameters**
- `entityType` (EntityType)
**Returns**
- `string`
**Defined at**: line 91

## Interfaces

### EntityTypeConfig

```ts

interface EntityTypeConfig

```

Entity type mapping configuration

**Properties**
- `entityType` (EntityType)
- `namespaceUri` (string)
- `name` (string)
- `identifier` (string)
**Defined at**: line 15

## Types

### EntityType

```ts

type EntityType = "TREE" | "KITA" | "DISTRICT"

```

Supported entity types for disambiguation

**Defined at**: line 10

## Constants

### ENTITY_TYPE_PREFIX

```ts

const ENTITY_TYPE_PREFIX: string

```

**Defined at**: line 24

### ENTITY_TYPE_CONFIGS

```ts

const ENTITY_TYPE_CONFIGS: Record<EntityType, EntityTypeConfig>

```

**Defined at**: line 28

## In qanary-component-dis

- `qanary-component-dis/entity-types`
- [`qanary-component-dis/fuzzy-matching`](../fuzzy-matching)
- [`qanary-component-dis/handler`](../handler)
- [`qanary-component-dis/implementation`](../implementation)
- [`qanary-component-dis/index`](..)
- [`qanary-component-dis/types`](../types)
