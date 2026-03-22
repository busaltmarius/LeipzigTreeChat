---
title: qanary-component-helpers/create-clarification-annotation
description: Auto-generated source code reference for packages/qanary-component-helpers/src/create-clarification-annotation.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/create-clarification-annotation`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/create-clarification-annotation.ts`

## Summary

Options for creating a clarification annotation in the knowledge graph.

## Functions

### escapeSparqlTripleQuoted

```ts

function escapeSparqlTripleQuoted(text: string): string

```

Escapes a string for safe use inside a SPARQL triple-quoted literal (`"""…"""`).

The only problematic sequence is three consecutive double-quotes which would
prematurely close the literal.  We also escape backslashes so that existing
escape sequences are preserved.

**Parameters**
- `text` (string)
**Returns**
- `string`
**Defined at**: line 25

### createClarificationAnnotation

```ts

function createClarificationAnnotation({
  message,
  componentName,
  clarificationQuestion,
}: ICreateClarificationAnnotationOptions): Promise<void>

```

Writes an `AnnotationOfClarification` into the Qanary knowledge graph.

The annotation is stored as:

```sparql
  ?annotation a <urn:qanary#AnnotationOfClarification> ;
    oa:hasBody "the question text" .

```

This is the format expected by the chatbot's
`TriplestoreService.queryClarifications()`.

**Parameters**
- `{
  message,
  componentName,
  clarificationQuestion,
}` (ICreateClarificationAnnotationOptions)
**Returns**
- `Promise<void>`
**Defined at**: line 41

## Interfaces

### ICreateClarificationAnnotationOptions

```ts

interface ICreateClarificationAnnotationOptions

```

Options for creating a clarification annotation in the knowledge graph.

**Properties**
- `message` (IQanaryMessage): The qanary message containing the endpoint and graph
- `componentName` (string): The component name that creates the annotation
- `clarificationQuestion` (string): The clarification question text to store
**Defined at**: line 9

## In qanary-component-helpers

- [`qanary-component-helpers/api`](/source-code/qanary-component-helpers/api)
- [`qanary-component-helpers/base`](/source-code/qanary-component-helpers/base)
- [`qanary-component-helpers/common`](/source-code/qanary-component-helpers/common)
- [`qanary-component-helpers/configuration`](/source-code/qanary-component-helpers/configuration)
- [`qanary-component-helpers/create-annotation`](/source-code/qanary-component-helpers/create-annotation)
- `qanary-component-helpers/create-clarification-annotation`
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
