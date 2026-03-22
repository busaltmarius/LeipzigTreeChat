---
title: qanary-component-core/services/registration/registration.model
description: Auto-generated source code reference for packages/qanary-component-core/src/services/registration/registration.model.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-core/services/registration/registration.model`

- Package: `@leipzigtreechat/qanary-component-core`
- Source file: `packages/qanary-component-core/src/services/registration/registration.model.ts`

## Summary

An object to process the SpringBootAdminUrl

## Classes

### SpringBootAdminUrl

```ts

class SpringBootAdminUrl extends URL

```

An object to process the SpringBootAdminUrl

**Extends**: `URL`
**Methods**
- `toConfiguration(): void`: Converts this object to an axios fetch configuration, required by the API
- `getDefault(): string`: Determines the available SpringBootAdminUrl, or return a static URL
- `from(): Promise<SpringBootAdminUrl>`: The factory method of the object
**Defined at**: line 10

### SpringBootAdminClientInstanceServiceBaseUrl

```ts

class SpringBootAdminClientInstanceServiceBaseUrl extends URL

```

An object to process the SpringBootAdminClientInstanceServiceBaseUrl

**Extends**: `URL`
**Methods**
- `getDefault(): Promise<string>`: Determines the available SpringBootAdminClientInstanceServiceBaseUrl, or return a static URL (dynamic port)
- `from(): Promise<SpringBootAdminClientInstanceServiceBaseUrl>`: The factory method of the object
**Defined at**: line 48

### RegistrationInfo

```ts

class RegistrationInfo

```

An object to register with the Spring Boot Admin as an available instance.

**Properties**
- `name` (string): The name of the instance
- `serviceUrl` (string): The URL, this service runs on
- `healthUrl` (string): The URL for checking the health of the instance
- `metadata` (Record<string, string>): Additional meta data
**Methods**
- `constructor(options: RegistrationInfo)`: The function to instantiate the object
- `from(config: QanaryComponentCoreServiceConfig): Promise<RegistrationInfo>`: Generates the registration object of the component for the Spring Boot Admin based on provided configuration
**Defined at**: line 77

### QanaryComponentCoreServiceConfig

```ts

class QanaryComponentCoreServiceConfig

```

An object containing the core configuration as URLs

**Properties**
- `springBootAdminClientInstanceServiceBaseUrl` (SpringBootAdminClientInstanceServiceBaseUrl): The URL of this service
- `springBootAdminUrl` (SpringBootAdminUrl): The URL at which is registered
**Methods**
- `constructor(options: QanaryComponentCoreServiceConfig)`: The function to instantiate the object
- `create(): void`: The factory method to create an `QanaryComponentCoreServiceConfig` object
**Defined at**: line 139

## In qanary-component-core

- [`qanary-component-core/helper/get-port`](../../../helper/get-port)
- [`qanary-component-core/helper/sleep`](../../../helper/sleep)
- [`qanary-component-core/index`](../../..)
- [`qanary-component-core/middlewares/error/error.middleware`](../../../middlewares/error/error.middleware)
- [`qanary-component-core/middlewares/error/error.model`](../../../middlewares/error/error.model)
- [`qanary-component-core/qanary-component-core`](../../../qanary-component-core)
- [`qanary-component-core/resources/about/about.controller`](../../../resources/about/about.controller)
- [`qanary-component-core/resources/about/about.model`](../../../resources/about/about.model)
- [`qanary-component-core/resources/about/about.router`](../../../resources/about/about.router)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.controller`](../../../resources/annotatequestion/annotatequestion.controller)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.model`](../../../resources/annotatequestion/annotatequestion.model)
- [`qanary-component-core/resources/annotatequestion/annotatequestion.router`](../../../resources/annotatequestion/annotatequestion.router)
- [`qanary-component-core/resources/health/health.controller`](../../../resources/health/health.controller)
- [`qanary-component-core/resources/health/health.router`](../../../resources/health/health.router)
- `qanary-component-core/services/registration/registration.model`
- [`qanary-component-core/services/registration/registration.service`](../registration.service)
