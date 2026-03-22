---
title: qanary-component-dis/fuzzy-matching
description: Auto-generated source code reference for apps/qanary-component-dis/src/fuzzy-matching.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-dis/fuzzy-matching`

- Package: `qanary-component-dis`
- Source file: `apps/qanary-component-dis/src/fuzzy-matching.ts`

## Summary

Simple Levenshtein distance between two strings.

## Functions

### levenshtein

```ts

function levenshtein(a: string, b: string): number

```

Simple Levenshtein distance between two strings.

**Parameters**
- `a` (string)
- `b` (string)
**Returns**
- `number`
**Defined at**: line 8

### similarity

```ts

function similarity(a: string, b: string): number

```

Normalized similarity score in [0, 1].
1.0 = identical, 0.0 = completely different.

**Parameters**
- `a` (string)
- `b` (string)
**Returns**
- `number`
**Defined at**: line 43

## In qanary-component-dis

- [`qanary-component-dis/entity-types`](/source-code/qanary-component-dis/entity-types)
- `qanary-component-dis/fuzzy-matching`
- [`qanary-component-dis/handler`](/source-code/qanary-component-dis/handler)
- [`qanary-component-dis/implementation`](/source-code/qanary-component-dis/implementation)
- [`qanary-component-dis/index`](/source-code/qanary-component-dis)
- [`qanary-component-dis/types`](/source-code/qanary-component-dis/types)
