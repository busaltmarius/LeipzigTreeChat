---
title: qanary-component-core/services/registration/registration.service
description: Auto-generated source code reference for packages/qanary-component-core/src/services/registration/registration.service.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-core/services/registration/registration.service`

- Package: `@leipzigtreechat/qanary-component-core`
- Source file: `packages/qanary-component-core/src/services/registration/registration.service.ts`

## Summary

The internal in which the service registers with the pipeline again in Milliseconds

## Functions

### callAdminServer

```ts

function callAdminServer(config: QanaryComponentCoreServiceConfig, registration: RegistrationInfo): void

```

Calls the Spring Boot Admin Server to register the component by sending a POST request

**Parameters**
- `config` (QanaryComponentCoreServiceConfig): the configuration of the component
- `registration` (RegistrationInfo): the registration information of the component
**Defined at**: line 33

### registrationService

```ts

function registrationService(config: QanaryComponentCoreServiceConfig, interval: unknown): void

```

Registers the component/service at the Spring Boot Admin Server and makes it available for the Qanary Pipeline

**Parameters**
- `config` (QanaryComponentCoreServiceConfig): the configuration of the component
- `interval` (unknown): the interval in which the component should call the Spring Boot Admin Server
**Defined at**: line 63

## Enums

### SUBSCRIPTION_STATUS

```ts

enum SUBSCRIPTION_STATUS

```

The possible connections between the Spring Boot Admin and this instance

**Properties**
- `UNKNOWN` (enum-member): the initial subscription status
- `SUBSCRIBED` (enum-member): the status if subscribing was successful
- `DETACHED` (enum-member): the status if subscribing was not successfull
**Defined at**: line 14

## Constants

### RENEW_REGISTRATION_INTERVAL

```ts

const RENEW_REGISTRATION_INTERVAL: number

```

The internal in which the service registers with the pipeline again in Milliseconds

**Defined at**: line 9

## Members

### subscriptionStatus

```ts

let subscriptionStatus: SUBSCRIPTION_STATUS

```

The status of the connection between the Spring Boot Admin and this component

**Defined at**: line 26

## In qanary-component-core

- [`qanary-component-core/helper/get-port`](/source-code/qanary-component-core/helper/get-port)
- [`qanary-component-core/helper/sleep`](/source-code/qanary-component-core/helper/sleep)
- [`qanary-component-core/index`](/source-code/qanary-component-core)
- [`qanary-component-core/middlewares/error/error.middleware`](/source-code/qanary-component-core/middlewares/error/error.middleware)
- [`qanary-component-core/middlewares/error/error.model`](/source-code/qanary-component-core/middlewares/error/error.model)
- [`qanary-component-core/qanary-component-core`](/source-code/qanary-component-core/qanary-component-core)
- [`qanary-component-core/resources/about/about.controller`](/source-code/qanary-component-core/resources/about/about.controller)
- [`qanary-component-core/resources/about/about.model`](/source-code/qanary-component-core/resources/about/about.model)
- [`qanary-component-core/resources/about/about.router`](/source-code/qanary-component-core/resources/about/about.router)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.controller`](/source-code/qanary-component-core/resources/annotatequestion/annotatequestion.controller)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.model`](/source-code/qanary-component-core/resources/annotatequestion/annotatequestion.model)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.router`](/source-code/qanary-component-core/resources/annotatequestion/annotatequestion.router)
- [`qanary-component-core/resources/health/health.controller`](/source-code/qanary-component-core/resources/health/health.controller)
- [`qanary-component-core/resources/health/health.router`](/source-code/qanary-component-core/resources/health/health.router)
- [`qanary-component-core/services/registration/registration.model`](/source-code/qanary-component-core/services/registration/registration.model)
- `qanary-component-core/services/registration/registration.service`
