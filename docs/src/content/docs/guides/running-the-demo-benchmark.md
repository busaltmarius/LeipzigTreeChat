---
title: Running the Demo Benchmark
description: How to run the live Baumbart chatbot benchmark and interpret the generated reports.
---

This guide explains how to run the stakeholder demo benchmark for the Baumbart
chatbot from the repository root.

The benchmark runs directly against `@leipzigtreechat/chatbot`, replays a fixed
set of German questions and dialogues, captures metadata and transcripts, and
writes JSON plus Markdown reports.

## What the benchmark does

The benchmark currently includes:

- 12 single-turn example questions
- 6 multi-turn dialogues
- rubric-based scoring instead of exact string matching
- output reports in `packages/chatbot/benchmark-results`

It is meant for demo evaluation and regression tracking, not as a strict CI
gate.

## Prerequisites

Before running the benchmark, make sure you have:

- installed dependencies with `bun install`
- a valid OpenRouter API key
- the local Qanary stack running
- the required environment variables in the root `.env`

For the full local stack setup, see
[Getting Started](/docs/guides/getting-started).

## Required environment variables

The root benchmark command explicitly loads the repository root `.env`.

The following variables must be set there:

```sh
VIRTUOSO_DBA_PASSWORD=your-secure-password
OPENROUTER_API_KEY=sk-or-v1-...
QANARY_API_BASE_URL=http://localhost:8080
TRIPLESTORE_URL=http://localhost:8890/sparql
```

These are the same local defaults already used elsewhere in the project:

- `QANARY_API_BASE_URL=http://localhost:8080`
- `TRIPLESTORE_URL=http://localhost:8890/sparql`

## Start the local services

The benchmark is a live-stack benchmark, so the supporting services must be
reachable before you run it.

Start the Docker services from the repository root:

```sh
docker compose up -d virtuoso qanary_pipeline leipzig-tree-knowledge-graph
```

Start the local workspace processes in another terminal:

```sh
bun run dev
```

This ensures the local Qanary components are available to the pipeline.

## Run the benchmark

From the repository root:

```sh
bun run benchmark:demo
```

The root script currently expands to:

```sh
bun --env-file=.env run --filter @leipzigtreechat/chatbot benchmark:demo
```

You can also run the package-level command directly:

```sh
cd packages/chatbot
bun --env-file=../../.env run benchmark:demo
```

## Benchmark output

Each run writes four files under `packages/chatbot/benchmark-results`:

- a timestamped JSON report
- a timestamped Markdown report
- `latest.json`
- `latest.md`

Example:

```text
packages/chatbot/benchmark-results/demo-benchmark-2026-03-22T12-49-11.637Z.json
packages/chatbot/benchmark-results/demo-benchmark-2026-03-22T12-49-11.637Z.md
packages/chatbot/benchmark-results/latest.json
packages/chatbot/benchmark-results/latest.md
```

The Markdown report includes:

- total case count
- pass rate
- clarification success rate
- graceful-failure success rate
- median case duration
- recommended demo subset
- grouped passed, soft-failed, and failed cases
- full transcripts for dialogue cases

## Interpreting failures

Common failure patterns:

- Missing `TRIPLESTORE_URL`: the benchmark cannot query the Qanary annotations
  graph and will fail very early.
- Missing `QANARY_API_BASE_URL`: the benchmark cannot call the Qanary pipeline.
- Missing `OPENROUTER_API_KEY`: question rewriting or response generation will
  fail in the LLM-backed steps.
- Docker services not running: Virtuoso or the Qanary pipeline are unreachable.
- Local Qanary components not running: the pipeline starts, but downstream
  answers stay empty or degrade into fallback responses.

If the benchmark starts but reports poor results across all cases, open
`packages/chatbot/benchmark-results/latest.md` first. It is the fastest way to
see whether the problem is:

- environment setup
- pipeline connectivity
- LLM configuration
- genuine chatbot quality

## Notes

- The benchmark tolerates paraphrased wording and does not require exact output
  strings.
- The benchmark currently runs against the live runtime, so results depend on
  data availability, model behavior, and local infrastructure health.
- Re-running the benchmark updates `latest.json` and `latest.md`.
