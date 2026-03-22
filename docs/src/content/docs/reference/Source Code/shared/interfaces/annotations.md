---
title: shared/interfaces/annotations
description: Auto-generated source code reference for packages/shared/src/interfaces/annotations.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `shared/interfaces/annotations`

- Package: `@leipzigtreechat/shared`
- Source file: `packages/shared/src/interfaces/annotations.ts`

## Summary

The qanary raw annotations received by querying the sparql endpoint

## Interfaces

### IRawAnnotation

```ts

interface IRawAnnotation

```

The qanary raw annotations received by querying the sparql endpoint

**Properties**
- `annotation` (NamedNode): the annotation node
- `annotationType` (NamedNode): the type of annotation, e.g AnnotationOfAnswer
- `target` (BlankNode): the target node of the annotation
- `body` (Literal): the body/value of the annotation
- `score` (Literal): the score/confidence of the annotation
- `annotatedBy` (NamedNode): the component that created the annotation
- `annotatedAt` (Literal): the time when the annotation was created
**Defined at**: line 6

### IQanaryAnnotation

```ts

interface IQanaryAnnotation

```

The qanary annotation interface

**Properties**
- `annotationType` (string): the type of annotation, e.g AnnotationAnswer
- `hasTarget` (string): the target of the annotation
- `hasBody` (string): the body/value of the annotation
- `annotatedAt` (string): the time when the annotation was created
- `annotatedBy` (string): the component that created the annotation
- `score` (number): the score/confidence of the annotation
**Defined at**: line 24

### IFilteredAnnotations

```ts

interface IFilteredAnnotations

```

The filtered annotations by domain.

**Properties**
- `stationAnnotation` (Array<IQanaryAnnotation>): annotations of the domain station
- `measurandAnnotation` (Array<IQanaryAnnotation>): annotations of the domain measurand
- `representationAnnotation` (Array<IQanaryAnnotation>): annotations of the domain representation
- `calculationAnnotation` (Array<IQanaryAnnotation>): annotations of the domain calculation
- `timeAnnotation` (Array<IQanaryAnnotation>): annotations of the domain time
**Defined at**: line 42

### ITimeObject

```ts

interface ITimeObject

```

The time object consisting of start and optional end time of an AnnotationOfTime.

**Properties**
- `start` (string): recognized start date
- `end` (string): recognized end date
**Defined at**: line 58

## In shared

- [`shared/constants/qanary`](../../constants/qanary)
- [`shared/enums/annotations`](../../enums/annotations)
- [`shared/enums/calculation`](../../enums/calculation)
- [`shared/enums/component-list`](../../enums/component-list)
- [`shared/enums/domains`](../../enums/domains)
- [`shared/enums/intents`](../../enums/intents)
- [`shared/enums/rasa-response-types`](../../enums/rasa-response-types)
- [`shared/enums/representation`](../../enums/representation)
- [`shared/helpers/create-annotation`](../../helpers/create-annotation)
- [`shared/helpers/get-question-uri`](../../helpers/get-question-uri)
- [`shared/helpers/get-question`](../../helpers/get-question)
- [`shared/helpers/message-operations`](../../helpers/message-operations)
- [`shared/helpers/query-sparql`](../../helpers/query-sparql)
- [`shared/helpers/question-uri-query`](../../helpers/question-uri-query)
- [`shared/index`](../..)
- `shared/interfaces/annotations`
- [`shared/interfaces/qanary-interfaces`](../qanary-interfaces)
- [`shared/interfaces/question-sparql-response copy`](../question-sparql-response copy)
- [`shared/interfaces/question-sparql-response`](../question-sparql-response)
- [`shared/interfaces/representation`](../representation)
- [`shared/maps/annotations`](../../maps/annotations)
