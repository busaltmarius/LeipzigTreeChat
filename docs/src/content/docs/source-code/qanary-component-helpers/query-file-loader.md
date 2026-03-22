---
title: qanary-component-helpers/query-file-loader
description: Auto-generated source code reference for packages/qanary-component-helpers/src/query-file-loader.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/query-file-loader`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/query-file-loader.ts`

## Summary

These are text fragments that can be substituted into SparQL query files to make parameterized queries.

## Functions

### queryFileLoader

```ts

function queryFileLoader(filePath: string, sparqlQueryReplacements: Array<ISparqlQueryReplacement>): string

```

A helper function to load SparQL files and replace text fragments if necessary. The return is a transformed text, of the given file.

**Parameters**
- `filePath` (string): the path of the file to read
- `sparqlQueryReplacements` (Array<ISparqlQueryReplacement>): a list of text fragments to replace as objects
**Returns**
- `string`
**Defined at**: line 24

## Interfaces

### ISparqlQueryReplacement

```ts

interface ISparqlQueryReplacement

```

A replacement object that replaces the keyword with a text fragment when loading a SparQL file.

**Properties**
- `keyword` (string)
- `replacement` (string)
**Defined at**: line 14

## Enums

### RESERVED_KEYWORD_IN_SPARQL_QUERY

```ts

enum RESERVED_KEYWORD_IN_SPARQL_QUERY

```

These are text fragments that can be substituted into SparQL query files to make parameterized queries.

**Properties**
- `YOUR_CURRENT_GRAPH_ID` (enum-member)
- `YOUR_ANNOTATION_TYPES` (enum-member)
**Defined at**: line 6

## In qanary-component-helpers

- [`qanary-component-helpers/api`](/source-code/qanary-component-helpers/api)
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
- `qanary-component-helpers/query-file-loader`
- [`qanary-component-helpers/query-sparql`](/source-code/qanary-component-helpers/query-sparql)
- [`qanary-component-helpers/utils/question-uri-query`](/source-code/qanary-component-helpers/utils/question-uri-query)
