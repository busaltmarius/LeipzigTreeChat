---
title: qanary-component-helpers/common
description: Auto-generated source code reference for packages/qanary-component-helpers/src/common.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/common`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/common.ts`

## Summary

No summary is available for this file.

## Functions

### assertParamExists

```ts

function assertParamExists(functionName: string, paramName: string, paramValue: unknown): void

```

**Parameters**
- `functionName` (string)
- `paramName` (string)
- `paramValue` (unknown)
**Defined at**: line 30

### setApiKeyToObject

```ts

function setApiKeyToObject(object: any, keyParamName: string, configuration: Configuration): void

```

**Parameters**
- `object` (any)
- `keyParamName` (string)
- `configuration` (Configuration)
**Defined at**: line 43

### setBasicAuthToObject

```ts

function setBasicAuthToObject(object: any, configuration: Configuration): void

```

**Parameters**
- `object` (any)
- `configuration` (Configuration)
**Defined at**: line 57

### setBearerAuthToObject

```ts

function setBearerAuthToObject(object: any, configuration: Configuration): void

```

**Parameters**
- `object` (any)
- `configuration` (Configuration)
**Defined at**: line 67

### setOAuthToObject

```ts

function setOAuthToObject(object: any, name: string, scopes: string[], configuration: Configuration): void

```

**Parameters**
- `object` (any)
- `name` (string)
- `scopes` (string[])
- `configuration` (Configuration)
**Defined at**: line 81

### setSearchParams

```ts

function setSearchParams(url: URL, objects: any[]): void

```

**Parameters**
- `url` (URL)
- `objects` (any[])
**Defined at**: line 113

### serializeDataIfNeeded

```ts

function serializeDataIfNeeded(value: any, requestOptions: any, configuration: Configuration): void

```

**Parameters**
- `value` (any)
- `requestOptions` (any)
- `configuration` (Configuration)
**Defined at**: line 123

### toPathString

```ts

function toPathString(url: URL): void

```

**Parameters**
- `url` (URL)
**Defined at**: line 136

### createRequestFunction

```ts

function createRequestFunction(axiosArgs: RequestArgs, globalAxios: AxiosInstance, BASE_PATH: string, configuration: Configuration): void

```

**Parameters**
- `axiosArgs` (RequestArgs)
- `globalAxios` (AxiosInstance)
- `BASE_PATH` (string)
- `configuration` (Configuration)
**Defined at**: line 142

## Constants

### DUMMY_BASE_URL

```ts

const DUMMY_BASE_URL: string

```

**Defined at**: line 23

## In qanary-component-helpers

- [`qanary-component-helpers/api`](../api)
- [`qanary-component-helpers/base`](../base)
- `qanary-component-helpers/common`
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
