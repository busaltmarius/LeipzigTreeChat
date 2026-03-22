---
title: qanary-component-core/middlewares/error/error.model
description: Auto-generated source code reference for packages/qanary-component-core/src/middlewares/error/error.model.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-core/middlewares/error/error.model`

- Package: `@leipzigtreechat/qanary-component-core`
- Source file: `packages/qanary-component-core/src/middlewares/error/error.model.ts`

## Summary

An error response as it can be processed by the Qanary pipeline

## Classes

### ErrorResponse

```ts

class ErrorResponse

```

An error response as it can be processed by the Qanary pipeline

**Properties**
- `timestamp` (string): A timestamp when the error has occurred
- `status` (number): The status code of the error
- `error` (string): The error message
- `path` (string): The endpoint where error has occurred
**Methods**
- `constructor(options: QanaryComponentApi.IQanaryComponentError)`: The function to instantiate the object
- `from(err: Error, req: Request): void`: The factory method of the object
**Defined at**: line 7

## In qanary-component-core

- [`qanary-component-core/helper/get-port`](../../../helper/get-port)
- [`qanary-component-core/helper/sleep`](../../../helper/sleep)
- [`qanary-component-core/index`](../../..)
- [`qanary-component-core/middlewares/error/error.middleware`](../error.middleware)
- `qanary-component-core/middlewares/error/error.model`
- [`qanary-component-core/qanary-component-core`](../../../qanary-component-core)
- [`qanary-component-core/resources/about/about.controller`](../../../resources/about/about.controller)
- [`qanary-component-core/resources/about/about.model`](../../../resources/about/about.model)
- [`qanary-component-core/resources/about/about.router`](../../../resources/about/about.router)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.controller`](../../../resources/annotatequestion/annotatequestion.controller)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.model`](../../../resources/annotatequestion/annotatequestion.model)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.router`](../../../resources/annotatequestion/annotatequestion.router)
- [`qanary-component-core/resources/health/health.controller`](../../../resources/health/health.controller)
- [`qanary-component-core/resources/health/health.router`](../../../resources/health/health.router)
- [`qanary-component-core/services/registration/registration.model`](../../../services/registration/registration.model)
- [`qanary-component-core/services/registration/registration.service`](../../../services/registration/registration.service)
