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

- [`qanary-component-helpers/api`](/source-code/qanary-component-helpers/api)
- [`qanary-component-helpers/base`](/source-code/qanary-component-helpers/base)
- [`qanary-component-helpers/common`](/source-code/qanary-component-helpers/common)
- [`qanary-component-helpers/configuration`](/source-code/qanary-component-helpers/configuration)
- `qanary-component-helpers/create-annotation`
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
