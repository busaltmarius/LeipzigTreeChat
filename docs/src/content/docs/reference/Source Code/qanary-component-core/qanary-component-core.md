---
title: qanary-component-core/qanary-component-core
description: Auto-generated source code reference for packages/qanary-component-core/src/qanary-component-core.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-core/qanary-component-core`

- Package: `@leipzigtreechat/qanary-component-core`
- Source file: `packages/qanary-component-core/src/qanary-component-core.ts`

## Summary

the options of the qanary component core with optional service config

## Functions

### QanaryComponentCore

```ts

function QanaryComponentCore(options: IQanaryComponentCoreOptions): Promise<Express>

```

The core implementation (blueprint) of a Qanary component

**Parameters**
- `options` (IQanaryComponentCoreOptions): the options of the component
**Returns**
- `Promise<Express>`: the express app instance
**Defined at**: line 23

## Interfaces

### IQanaryComponentCoreOptions

```ts

interface IQanaryComponentCoreOptions

```

the options of the qanary component core with optional service config

**Properties**
- `handler` (IQanaryComponentMessageHandler): the request handler of the qanary component/service
**Defined at**: line 13

## In qanary-component-core

- [`qanary-component-core/helper/get-port`](../helper/get-port)
- [`qanary-component-core/helper/sleep`](../helper/sleep)
- [`qanary-component-core/index`](..)
- [`qanary-component-core/middlewares/error/error.middleware`](../middlewares/error/error.middleware)
- [`qanary-component-core/middlewares/error/error.model`](../middlewares/error/error.model)
- `qanary-component-core/qanary-component-core`
- [`qanary-component-core/resources/about/about.controller`](../resources/about/about.controller)
- [`qanary-component-core/resources/about/about.model`](../resources/about/about.model)
- [`qanary-component-core/resources/about/about.router`](../resources/about/about.router)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.controller`](../resources/annotatequestion/annotatequestion.controller)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.model`](../resources/annotatequestion/annotatequestion.model)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.router`](../resources/annotatequestion/annotatequestion.router)
- [`qanary-component-core/resources/health/health.controller`](../resources/health/health.controller)
- [`qanary-component-core/resources/health/health.router`](../resources/health/health.router)
- [`qanary-component-core/services/registration/registration.model`](../services/registration/registration.model)
- [`qanary-component-core/services/registration/registration.service`](../services/registration/registration.service)
