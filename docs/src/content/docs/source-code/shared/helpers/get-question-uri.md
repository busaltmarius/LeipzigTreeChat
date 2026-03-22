---
title: shared/helpers/get-question-uri
description: Auto-generated source code reference for packages/shared/src/helpers/get-question-uri.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `shared/helpers/get-question-uri`

- Package: `@leipzigtreechat/shared`
- Source file: `packages/shared/src/helpers/get-question-uri.ts`

## Summary

Gets the question uri from the graph given in the message

## Functions

### getQuestionUri

```ts

function getQuestionUri(message: IQanaryMessage): Promise<string | null>

```

Gets the question uri from the graph given in the message

**Parameters**
- `message` (IQanaryMessage): the message containing the graph and endpoint
**Returns**
- `Promise<string | null>`: the uri of the question
**Defined at**: line 12

## In shared

- [`shared/constants/qanary`](/source-code/shared/constants/qanary)
- [`shared/enums/annotations`](/source-code/shared/enums/annotations)
- [`shared/enums/calculation`](/source-code/shared/enums/calculation)
- [`shared/enums/component-list`](/source-code/shared/enums/component-list)
- [`shared/enums/domains`](/source-code/shared/enums/domains)
- [`shared/enums/intents`](/source-code/shared/enums/intents)
- [`shared/enums/rasa-response-types`](/source-code/shared/enums/rasa-response-types)
- [`shared/enums/representation`](/source-code/shared/enums/representation)
- [`shared/helpers/create-annotation`](/source-code/shared/helpers/create-annotation)
- `shared/helpers/get-question-uri`
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
