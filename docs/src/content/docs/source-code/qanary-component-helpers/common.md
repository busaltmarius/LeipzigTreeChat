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

- [`qanary-component-helpers/api`](/source-code/qanary-component-helpers/api)
- [`qanary-component-helpers/base`](/source-code/qanary-component-helpers/base)
- `qanary-component-helpers/common`
- [`qanary-component-helpers/configuration`](/source-code/qanary-component-helpers/configuration)
- [`qanary-component-helpers/create-annotation`](/source-code/qanary-component-helpers/create-annotation)
- [`qanary-component-helpers/create-clarification-annotation`](/source-code/qanary-component-helpers/create-clarification-annotation)
- [`qanary-component-helpers/generate-clarification-question`](/source-code/qanary-component-helpers/generate-clarification-question)
- [`qanary-component-helpers/generate-object-retry`](/source-code/qanary-component-helpers/generate-object-retry)
- [`qanary-component-helpers/get-domain-instances`](/source-code/qanary-component-helpers/get-domain-instances)
- [`qanary-component-helpers/get-question-uri`](/source-code/qanary-component-helpers/get-question-uri)
- [`qanary-component-helpers/get-question`](/source-code/qanary-component-helpers/get-question)
- [`qanary-component-helpers/index`](/source-code/qanary-component-helpers)
- [`qanary-component-helpers/interfaces/question-sparql-response`](/source-code/qanary-component-helpers/interfaces/question-sparql-response)
- [`qanary-component-helpers/llm-provider`](/source-code/qanary-component-helpers/llm-provider)
- [`qanary-component-helpers/message-operations`](/source-code/qanary-component-helpers/message-operations)
- [`qanary-component-helpers/query-file-loader`](/source-code/qanary-component-helpers/query-file-loader)
- [`qanary-component-helpers/query-sparql`](/source-code/qanary-component-helpers/query-sparql)
- [`qanary-component-helpers/utils/question-uri-query`](/source-code/qanary-component-helpers/utils/question-uri-query)
