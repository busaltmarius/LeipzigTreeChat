---
title: qanary-component-helpers/create-annotation
description: Auto-generated source code reference for packages/qanary-component-helpers/src/create-annotation.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/create-annotation`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/create-annotation.ts`

## Summary

The interface for the information needed for a qanary annotation
 value the value of the found annotation
 range the range of the found annotation

## Functions

### createAnnotationInKnowledgeGraph

```ts

function createAnnotationInKnowledgeGraph({
  message,
  componentName,
  annotation,
  annotationType = "qa:AnnotationAnswer",
}: ICreateAnnotationInKnowledgeGraphOptions): Promise<void>

```

Creates an annotation in the knowledge graph given in the message

**Parameters**
- `{
  message,
  componentName,
  annotation,
  annotationType = "qa:AnnotationAnswer",
}` (ICreateAnnotationInKnowledgeGraphOptions)
**Returns**
- `Promise<void>`
**Defined at**: line 54

## Interfaces

### IAnnotationInformation

```ts

interface IAnnotationInformation

```

The interface for the information needed for a qanary annotation
 value the value of the found annotation
 range the range of the found annotation

**Properties**
- `value` (string): the value of the found annotation
- `range` (IAnnotationInformationRange): the range of the found annotation
- `confidence` (number): the confidence of the found annotation
**Defined at**: line 12

### IAnnotationInformationRange

```ts

interface IAnnotationInformationRange

```

The range info range for a qanary annotation
 start the start of the found annotation
 end the end of the found annotation

**Properties**
- `start` (number): the start of the found annotation
- `end` (number): the end of the found annotation
**Defined at**: line 26

### ICreateAnnotationInKnowledgeGraphOptions

```ts

interface ICreateAnnotationInKnowledgeGraphOptions

```

The options to create an annotation in the knowledge graph

**Properties**
- `message` (IQanaryMessage): the qanary message containing the endpoint and graph
- `componentName` (string): the component name that creates the annotation
- `annotation` (IAnnotationInformation): the actual annotation to be created
- `annotationType` (string): the type of the annotation, prefixed with "qa:", defaults to "qa:AnnotationAnswer"
**Defined at**: line 36

## In qanary-component-helpers

- [`qanary-component-helpers/api`](../api)
- [`qanary-component-helpers/base`](../base)
- [`qanary-component-helpers/common`](../common)
- [`qanary-component-helpers/configuration`](../configuration)
- `qanary-component-helpers/create-annotation`
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
