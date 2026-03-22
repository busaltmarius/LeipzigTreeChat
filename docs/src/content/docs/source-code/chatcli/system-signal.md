---
title: chatcli/system-signal
description: Auto-generated source code reference for apps/chatcli/src/system-signal.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `chatcli/system-signal`

- Package: `chatcli`
- Source file: `apps/chatcli/src/system-signal.ts`

## Summary

No summary is available for this file.

## Classes

### SystemSignalError

```ts

class SystemSignalError extends Data.TaggedError("SystemSignalError")<{
  signal: Signal;
}>

```

**Extends**: `Data.TaggedError("SystemSignalError")<{
  signal: Signal;
}>`
**Defined at**: line 4

## Functions

### handleSystemSignalError

```ts

function handleSystemSignalError(error: SystemSignalError): void

```

**Parameters**
- `error` (SystemSignalError)
**Defined at**: line 8

## In chatcli

- [`chatcli/dialog1`](/source-code/chatcli/dialog1)
- [`chatcli/dialog2`](/source-code/chatcli/dialog2)
- [`chatcli/index`](/source-code/chatcli)
- [`chatcli/readline`](/source-code/chatcli/readline)
- `chatcli/system-signal`
