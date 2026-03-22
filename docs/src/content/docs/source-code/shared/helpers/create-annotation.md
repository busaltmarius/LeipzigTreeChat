---
title: shared/helpers/create-annotation
description: Auto-generated source code reference for packages/shared/src/helpers/create-annotation.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `shared/helpers/create-annotation`

- Package: `@leipzigtreechat/shared`
- Source file: `packages/shared/src/helpers/create-annotation.ts`

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

## In shared

- [`shared/constants/qanary`](/source-code/shared/constants/qanary)
- [`shared/enums/annotations`](/source-code/shared/enums/annotations)
- [`shared/enums/calculation`](/source-code/shared/enums/calculation)
- [`shared/enums/component-list`](/source-code/shared/enums/component-list)
- [`shared/enums/domains`](/source-code/shared/enums/domains)
- [`shared/enums/intents`](/source-code/shared/enums/intents)
- [`shared/enums/rasa-response-types`](/source-code/shared/enums/rasa-response-types)
- [`shared/enums/representation`](/source-code/shared/enums/representation)
- `shared/helpers/create-annotation`
- [`shared/helpers/get-question-uri`](/source-code/shared/helpers/get-question-uri)
- [`shared/helpers/get-question`](/source-code/shared/helpers/get-question)
- [`shared/helpers/message-operations`](/source-code/shared/helpers/message-operations)
- [`shared/helpers/query-sparql`](/source-code/shared/helpers/query-sparql)
- [`shared/helpers/question-uri-query`](/source-code/shared/helpers/question-uri-query)
- [`shared/index`](/source-code/shared)
- [`shared/interfaces/annotations`](/source-code/shared/interfaces/annotations)
- [`shared/interfaces/qanary-interfaces`](/source-code/shared/interfaces/qanary-interfaces)
- [`shared/interfaces/question-sparql-response copy`](/source-code/shared/interfaces/question-sparql-response copy)
- [`shared/interfaces/question-sparql-response`](/source-code/shared/interfaces/question-sparql-response)
- [`shared/interfaces/representation`](/source-code/shared/interfaces/representation)
- [`shared/maps/annotations`](/source-code/shared/maps/annotations)
