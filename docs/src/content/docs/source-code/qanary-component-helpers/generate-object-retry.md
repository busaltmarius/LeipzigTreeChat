---
title: qanary-component-helpers/generate-object-retry
description: Auto-generated source code reference for packages/qanary-component-helpers/src/generate-object-retry.ts.
---

> This page is auto-generated from TSDoc output. Edit the source file, not this Markdown.

# `qanary-component-helpers/generate-object-retry`

- Package: `@leipzigtreechat/qanary-component-helpers`
- Source file: `packages/qanary-component-helpers/src/generate-object-retry.ts`

## Summary

Extracts the first valid JSON object from text that may be wrapped in
markdown code fences, preceded by prose, or followed by explanations.

Extraction strategy (in order):
 1. Content inside a markdown code fence  (json …  or  … )
 2. First well-formed JSON object `{…}` found anywhere in the text

## Functions

### extractJsonFromText

```ts

function extractJsonFromText(text: string): string | null

```

Extracts the first valid JSON object from text that may be wrapped in
markdown code fences, preceded by prose, or followed by explanations.

Extraction strategy (in order):
 1. Content inside a markdown code fence  (json …  or  … )
 2. First well-formed JSON object `{…}` found anywhere in the text

**Parameters**
- `text` (string)
**Returns**
- `string | null`: The extracted JSON string (trimmed), or `null` if nothing
         parseable was found.
**Examples**
extractJsonFromText('Here:njsonn"a":1nnDone.')  // '"a":1'
extractJsonFromText('"b":2')                              // '"b":2'
extractJsonFromText('No JSON here.')                        // null
**Defined at**: line 20

### getRawTextFromError

```ts

function getRawTextFromError(error: unknown): string | undefined

```

Retrieves the raw LLM response text stored on AI SDK error objects.

Both `NoObjectGeneratedError` and `JSONParseError` (from `@ai-sdk/provider`)
expose the original model response via a `text` property on the thrown
error instance.

**Parameters**
- `error` (unknown)
**Returns**
- `string | undefined`
**Defined at**: line 95

### generateObjectWithRetry

```ts

function generateObjectWithRetry(options: {
    model: LanguageModel;
    /**
     * A Zod (v3 or v4) schema – or any object with a compatible `safeParse`
     * method – that describes the expected response shape.
     */
    schema: ParseableSchema<T>;
    system?: string;
    prompt: string;
  }, maxRetries: unknown): Promise<{ object: T }>

```

Drop-in replacement for the AI SDK's `generateObject` that adds two
recovery strategies for models that do not return clean JSON:

**Strategy 1 – Markdown extraction (no extra LLM call):**
Some instruction-tuned models (e.g. `anthropic/claude-3.5-haiku` via
OpenRouter) wrap their JSON response in a markdown code fence even when
asked not to.  The AI SDK then throws a parse error that carries the full
raw response in its `text` property.  We extract the JSON from that text
and validate it against the caller's schema before spending another token.

**Strategy 2 – Retry with explicit JSON reminder:**
If extraction fails (or the error had no raw text), we retry the full LLM
call.  On every retry we append a reminder to the prompt asking for plain
JSON without markdown, giving the model a chance to self-correct.

**Parameters**
- `options` ({
    model: LanguageModel;
    /**
     * A Zod (v3 or v4) schema – or any object with a compatible `safeParse`
     * method – that describes the expected response shape.
     */
    schema: ParseableSchema<T>;
    system?: string;
    prompt: string;
  }): Same options accepted by the AI SDK's `generateObject`
                  (`model`, `schema`, `system`, `prompt`).
- `maxRetries` (unknown): Maximum number of LLM calls in total.  Defaults to `3`.
**Returns**
- `Promise<{ object: T }>`: `{ object: T }` – same shape as `generateObject`.
**Defined at**: line 137

## Types

### ParseableSchema

```ts

type ParseableSchema = {
  safeParse(data: unknown): { success: boolean; data?: T };
}

```

Minimal schema interface required by .

Structurally compatible with both Zod v3 and Zod v4 schemas – no direct
Zod import is needed in this package.

**Defined at**: line 111

## In qanary-component-helpers

- [`qanary-component-helpers/api`](/source-code/qanary-component-helpers/api)
- [`qanary-component-helpers/base`](/source-code/qanary-component-helpers/base)
- [`qanary-component-helpers/common`](/source-code/qanary-component-helpers/common)
- [`qanary-component-helpers/configuration`](/source-code/qanary-component-helpers/configuration)
- [`qanary-component-helpers/create-annotation`](/source-code/qanary-component-helpers/create-annotation)
- [`qanary-component-helpers/create-clarification-annotation`](/source-code/qanary-component-helpers/create-clarification-annotation)
- [`qanary-component-helpers/generate-clarification-question`](/source-code/qanary-component-helpers/generate-clarification-question)
- `qanary-component-helpers/generate-object-retry`
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
