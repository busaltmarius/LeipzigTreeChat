---
title: Getting Started
description: Guide how to get started using and developing the Baumbart chatbot.
---

This guide gets you from a fresh clone to a working local Baumbart chatbot.
The main target is the browser-based `chatui`, backed by the full Qanary
pipeline and the Leipzig tree knowledge graph.

## What you will run

Baumbart is not a single process. A working local setup needs:

- Docker services for Virtuoso, the Qanary pipeline, and the Leipzig tree
  knowledge graph
- Local Bun processes for the chat UI, shared packages, and the Qanary
  components
- An OpenRouter API key for the LLM-backed parts of the system

## Prerequisites

Before you start, make sure you have:

- [Bun](https://bun.sh/) `>= 1.3.2`
- Docker with Compose
- An OpenRouter API key

## 1. Install dependencies

From the repository root, install all workspace dependencies:

```sh
bun install
```

## 2. Create environment files

Create local `.env` files from the checked-in examples:

```sh
cp apps/chatui/.env.example apps/chatui/.env
cp apps/chatcli/.env.example apps/chatcli/.env
cp apps/qanary-component-eat-simple/.env.example apps/qanary-component-eat-simple/.env
cp apps/qanary-component-nerd-simple/.env.example apps/qanary-component-nerd-simple/.env
cp apps/qanary-component-dis/.env.example apps/qanary-component-dis/.env
cp apps/qanary-component-relation-detection/.env.example apps/qanary-component-relation-detection/.env
cp apps/qanary-component-sparql-generation/.env.example apps/qanary-component-sparql-generation/.env
```

You also need a root-level `.env` file for Docker Compose:

```sh
printf 'VIRTUOSO_DBA_PASSWORD=your-secure-password\n' > .env
```

## 3. Fill in the required variables

Update the new `.env` files with real values:

- In `apps/chatui/.env` and `apps/chatcli/.env`:
    - `OPENROUTER_API_KEY` must contain a valid OpenRouter key
    - `QANARY_API_BASE_URL` should stay `http://localhost:8080`
    - `TRIPLESTORE_URL` should stay `http://localhost:8890/sparql`
- In every `apps/qanary-component-*/.env`:
    - `SPRING_BOOT_ADMIN_URL` should stay `http://localhost:8080/`
    - `QANARY_PORT` should keep the port from the example file
    - `OPENROUTER_API_KEY` must be filled in for the LLM-backed components
- In the root `.env`:
    - `VIRTUOSO_DBA_PASSWORD` is required by `docker compose`

## 4. Important Docker networking note

The Qanary pipeline runs in Docker, but the Qanary components run on your host
machine during local development. Because of that, each component `.env` should
use:

```sh
QANARY_HOST=host.docker.internal
```

If `QANARY_HOST` is left as `localhost`, the pipeline container will try to call
itself instead of your locally running component.

## 5. Start the infrastructure

Start the Docker services from the repository root:

```sh
docker compose up -d virtuoso qanary_pipeline leipzig-tree-knowledge-graph
```

This starts:

- `virtuoso` on port `8890` for Qanary annotations and SPARQL reads
- `qanary_pipeline` on port `8080` to orchestrate the question-answering flow
- `leipzig-tree-knowledge-graph` on port `8000` as the domain knowledge base

## 6. Start the local code

In a second terminal, start the monorepo dev processes:

```sh
bun run dev
```

This is the main local development path. It starts the workspace watchers,
`chatui`, and the Qanary components needed by the pipeline.

## 7. Open the chatbot

Open the Vite URL shown in the terminal. In a standard local setup that will be:

```text
http://localhost:5173
```

When the page loads, you should see the Baumbart greeting and an active chat
input.

## 8. Smoke test

Use this sample question from the repository:

```text
Wie viel wurde im Stadtteil Connewitz gegossen?
```

Your local setup is working if:

- the page loads
- the initial Baumbart greeting is visible
- your message is accepted by the UI
- the chatbot returns an answer instead of a pipeline, websocket, or
  configuration error

## 9. Optional CLI check

If you want to verify the chatbot outside the browser, you can also run the CLI:

```sh
bun run dev --filter=chatcli
```

## 10. Run the demo benchmark

If you want to benchmark the live chatbot with the curated demo question set,
run:

```sh
bun run benchmark:demo
```

For the benchmark-specific workflow and report format, see
[Running the Demo Benchmark](/docs/guides/running-the-demo-benchmark).

## Troubleshooting

- Missing `OPENROUTER_API_KEY`: the chat UI or one of the LLM-backed components
  will fail when it tries to generate or classify text.
- `QANARY_HOST=localhost`: the Qanary pipeline container cannot reach locally
  running components. Use `host.docker.internal` instead.
- Docker services not healthy: make sure ports `8080`, `8890`, and `8000` are
  reachable and that `docker compose ps` shows the services as running.
- Component ports not available: the local Qanary components need ports
  `40500` to `40504`. If one of these ports is occupied, the affected component
  will not start correctly.
