---
title: qanary-component-helpers/base
description: Auto-generated source code reference for packages/qanary-component-helpers/src/base.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/base`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/base.ts`

## Summary

RequestArgs

## Classes

### BaseAPI

```ts

class BaseAPI

```

BaseAPI

**Properties**
- `configuration` (Configuration | undefined)
**Methods**
- `constructor(configuration: Configuration, basePath: string, axios: AxiosInstance)`
**Defined at**: line 47

### RequiredError

```ts

class RequiredError extends Error

```

RequiredError
 Error

**Extends**: `Error`
**Properties**
- `name` ("RequiredError")
**Methods**
- `constructor(field: string, msg: string)`
**Defined at**: line 68

## Interfaces

### RequestArgs

```ts

interface RequestArgs

```

RequestArgs

**Properties**
- `url` (string)
- `options` (AxiosRequestConfig)
**Defined at**: line 37

## Constants

### BASE_PATH

```ts

const BASE_PATH: unknown

```

**Defined at**: line 19

### COLLECTION_FORMATS

```ts

const COLLECTION_FORMATS: object

```

**Defined at**: line 25

## In qanary-component-helpers

- [`qanary-component-helpers/api`](../api)
- `qanary-component-helpers/base`
- [`qanary-component-helpers/common`](../common)
- [`qanary-component-helpers/configuration`](../configuration)
- [`qanary-component-helpers/create-annotation`](../create-annotation)
- [`qanary-component-helpers/create-clarification-annotation`](../create-clarification-annotation)
- [`qanary-component-helpers/generate-clarification-question`](../generate-clarification-question)
- [`qanary-component-helpers/generate-object-retry`](../generate-object-retry)
- [`qanary-component-helpers/get-domain-instances`](../get-domain-instances)
- [`qanary-component-helpers/get-question-uri`](../get-question-uri)
- [`qanary-component-helpers/get-question`](../get-question)
- [`qanary-component-helpers/index`](..)
- [`qanary-component-helpers/interfaces/question-sparql-response`](../interfaces/question-sparql-response)
- [`qanary-component-helpers/llm-provider`](../llm-provider)
- [`qanary-component-helpers/message-operations`](../message-operations)
- [`qanary-component-helpers/query-file-loader`](../query-file-loader)
- [`qanary-component-helpers/query-sparql`](../query-sparql)
- [`qanary-component-helpers/utils/question-uri-query`](../utils/question-uri-query)
