---
title: qanary-component-core/resources/annotatequestion/annotatequestion.controller
description: Auto-generated source code reference for packages/qanary-component-core/src/resources/annotatequestion/annotatequestion.controller.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-core/resources/annotatequestion/annotatequestion.controller`

- Package: `@leipzigtreechat/qanary-component-core`
- Source file: `packages/qanary-component-core/src/resources/annotatequestion/annotatequestion.controller.ts`

## Summary

Validates if all necessary properties are members of the message object

## Functions

### isValidateMessage

```ts

function isValidateMessage(message: QanaryComponentApi.IQanaryMessage): void

```

Validates if all necessary properties are members of the message object

**Parameters**
- `message` (QanaryComponentApi.IQanaryMessage): incoming qanary pipeline message
**Defined at**: line 10

### createAnnotateQuestion

```ts

function createAnnotateQuestion(handler: IQanaryComponentMessageHandler): Promise<RequestHandler>

```

Request handler for the `/annotatequestion` endpoint

**Parameters**
- `handler` (IQanaryComponentMessageHandler): the event handler for incoming messages of the Qanary pipeline, passed the using component
**Returns**
- `Promise<RequestHandler>`
**Defined at**: line 18

## In qanary-component-core

- [`qanary-component-core/helper/get-port`](../../../helper/get-port)
- [`qanary-component-core/helper/sleep`](../../../helper/sleep)
- [`qanary-component-core/index`](../../..)
- [`qanary-component-core/middlewares/error/error.middleware`](../../../middlewares/error/error.middleware)
- [`qanary-component-core/middlewares/error/error.model`](../../../middlewares/error/error.model)
- [`qanary-component-core/qanary-component-core`](../../../qanary-component-core)
- [`qanary-component-core/resources/about/about.controller`](../../about/about.controller)
- [`qanary-component-core/resources/about/about.model`](../../about/about.model)
- [`qanary-component-core/resources/about/about.router`](../../about/about.router)
- `qanary-component-core/resources/annotatequestion/annotatequestion.controller`
- [`qanary-component-core/resources/annotatequestion/annotatequestion.model`](../annotatequestion.model)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.router`](../annotatequestion.router)
- [`qanary-component-core/resources/health/health.controller`](../../health/health.controller)
- [`qanary-component-core/resources/health/health.router`](../../health/health.router)
- [`qanary-component-core/services/registration/registration.model`](../../../services/registration/registration.model)
- [`qanary-component-core/services/registration/registration.service`](../../../services/registration/registration.service)
