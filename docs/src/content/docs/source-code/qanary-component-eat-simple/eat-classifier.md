---
title: qanary-component-eat-simple/eat-classifier
description: Auto-generated source code reference for apps/qanary-component-eat-simple/src/eat-classifier.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-eat-simple/eat-classifier`

- Package: `qanary-component-eat-simple`
- Source file: `apps/qanary-component-eat-simple/src/eat-classifier.ts`

## Summary

All supported Expected Answer Types.
Each maps to a URN in the Qanary EAT namespace.

## Functions

### classifyExpectedAnswerType

```ts

function classifyExpectedAnswerType(question: string, modelFactory: () => ReturnType<typeof getLlmModel>): Promise<EatResponse | null>

```

Calls the LLM to classify the expected answer type for a question.

**Parameters**
- `question` (string): The natural-language question to classify.
- `modelFactory` (() => ReturnType<typeof getLlmModel>): Optional override for the model factory (for testing).
**Returns**
- `Promise<EatResponse | null>`: The full structured EAT response, or null if classification fails.
**Defined at**: line 75

### eatTypeToUrl

```ts

function eatTypeToUrl(eatType: EatType): URL

```

Maps an EatType string to its full Qanary EAT namespace URL.

**Parameters**
- `eatType` (EatType)
**Returns**
- `URL`
**Defined at**: line 103

## Types

### EatType

```ts

type EatType = (typeof EAT_TYPES)[number]

```

**Defined at**: line 22

### EatResponse

```ts

type EatResponse = z.infer<typeof EatResponseSchema>

```

**Defined at**: line 43

## Constants

### EAT_TYPES

```ts

const EAT_TYPES: unknown

```

All supported Expected Answer Types.
Each maps to a URN in the Qanary EAT namespace.

**Defined at**: line 9

### EatResponseSchema

```ts

const EatResponseSchema: unknown

```

Zod schema for the structured LLM response.
Using `generateObject` forces the model to return a validated enum value
instead of free-form text, eliminating fragile string parsing.

**Defined at**: line 29

## In qanary-component-eat-simple

- `qanary-component-eat-simple/eat-classifier`
- [`qanary-component-eat-simple/handler`](/source-code/qanary-component-eat-simple/handler)
- [`qanary-component-eat-simple/index`](/source-code/qanary-component-eat-simple)
