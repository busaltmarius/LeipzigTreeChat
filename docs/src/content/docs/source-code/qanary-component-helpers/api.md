---
title: qanary-component-helpers/api
description: Auto-generated source code reference for packages/qanary-component-helpers/src/api.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/api`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/api.ts`

## Summary

The meta data that will be provided to the Spring Boot Admin

 IQanaryComponentAbout

## Functions

### QanaryServiceControllerApiAxiosParamCreator

```ts

function QanaryServiceControllerApiAxiosParamCreator(configuration: Configuration): void

```

QanaryServiceControllerApi - axios parameter creator

**Parameters**
- `configuration` (Configuration)
**Defined at**: line 148

### QanaryServiceControllerApiFp

```ts

function QanaryServiceControllerApiFp(configuration: Configuration): void

```

QanaryServiceControllerApi - functional programming interface

**Parameters**
- `configuration` (Configuration)
**Defined at**: line 245

### QanaryServiceControllerApiFactory

```ts

function QanaryServiceControllerApiFactory(configuration: Configuration, basePath: string, axios: AxiosInstance): void

```

QanaryServiceControllerApi - factory interface

**Parameters**
- `configuration` (Configuration)
- `basePath` (string)
- `axios` (AxiosInstance)
**Defined at**: line 293

## Interfaces

### IQanaryComponentAbout

```ts

interface IQanaryComponentAbout

```

The meta data that will be provided to the Spring Boot Admin

 IQanaryComponentAbout

**Properties**
- `name` (string): The name of the qanary component
 string
 IQanaryComponentAbout
- `description` (string): The description of the qanary component
 string
 IQanaryComponentAbout
- `version` (string): The version of the qanary component
 string
 IQanaryComponentAbout
**Defined at**: line 33

### IQanaryComponentError

```ts

interface IQanaryComponentError

```

Bad Request when request body is invalid

 IQanaryComponentError

**Properties**
- `timestamp` (string): A timestamp when the error has occurred
 string
 IQanaryComponentError
- `status` (number): The status code of the error
 number
 IQanaryComponentError
- `error` (string): The error message
 string
 IQanaryComponentError
- `path` (string): The endpoint where error has occurred
 string
 IQanaryComponentError
**Defined at**: line 58

### IQanaryComponentHealth

```ts

interface IQanaryComponentHealth

```

An object describing the overall status of the service

 IQanaryComponentHealth

**Properties**
- `status` (IQanaryComponentHealthStatusEnum): The overall status of the service
 string
 IQanaryComponentHealth
**Defined at**: line 89

### IQanaryMessage

```ts

interface IQanaryMessage

```

The qanary message that is received/send by the component

 IQanaryMessage

**Properties**
- `values` ({ [key: string]: string }): Additional values
  [key: string]: string; 
 IQanaryMessage
- `inGraph` (string): The graph uri of the knowledge graph that contains information for the incoming request
 string
 IQanaryMessage
- `endpoint` (string): The sparql endpoint as url
 string
 IQanaryMessage
- `outGraph` (string): The graph uri of the knowledge graph that contains information for the outgoing response
 string
 IQanaryMessage
- `question` (string): The url of the stored question
 string
 IQanaryMessage
**Defined at**: line 111

## Types

### IQanaryComponentHealthStatusEnum

```ts

type IQanaryComponentHealthStatusEnum = (typeof IQanaryComponentHealthStatusEnum)[keyof typeof IQanaryComponentHealthStatusEnum]

```

**Defined at**: line 103

## Constants

### IQanaryComponentHealthStatusEnum

```ts

const IQanaryComponentHealthStatusEnum: unknown

```

**Defined at**: line 98

## In qanary-component-helpers

- `qanary-component-helpers/api`
- [`qanary-component-helpers/base`](/source-code/qanary-component-helpers/base)
- [`qanary-component-helpers/common`](/source-code/qanary-component-helpers/common)
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
