# Baumbart

Baumbart is a monorepo for the Leipzig tree chatbot. It contains the web UI,
the CLI, the shared chatbot runtime, several Qanary components, and the
documentation site.

## Repository Layout

- `apps/chatui`: SvelteKit web frontend for the chatbot
- `apps/chatcli`: terminal interface for the chatbot runtime
- `apps/qanary-component-*`: Qanary pipeline components used for structured
  question answering
- `packages/*`: shared TypeScript packages for the chatbot runtime and Qanary
  integrations
- `docs`: Astro Starlight documentation site

## Requirements

- [Bun](https://bun.sh/) `>= 1.3.2`
- Docker with Compose for the full local stack

## Install

```sh
bun install
```

## Common Commands

Run these from the repository root unless noted otherwise.

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start workspace development processes via Turborepo |
| `bun run build` | Build workspace apps and packages |
| `bun run clean` | Clean workspace build outputs |
| `bun run format-and-lint` | Check formatting and linting with Biome |
| `bun run format-and-lint:fix` | Apply Biome fixes |
| `bun run tsdoc` | Generate TSDoc output for workspace packages |
| `bun run docs:reference` | Generate source-reference pages for the docs site |
| `bun run docs:build` | Generate source-reference pages and build the docs site |

## Local Setup

The main local development setup is more than `bun run dev`. A working Baumbart
stack also needs:

- `.env` files for the apps and Qanary components
- an OpenRouter API key
- Docker services for Virtuoso, the Qanary pipeline, and the Leipzig tree
  knowledge graph

Use the detailed guide in
[`docs/src/content/docs/guides/getting-started.md`](./docs/src/content/docs/guides/getting-started.md)
for the full setup sequence.

## Documentation

- Main docs source:
  [`docs/src/content/docs/`](./docs/src/content/docs/)
- Docs package README:
  [`docs/README.md`](./docs/README.md)
- Architecture guide:
  [`docs/src/content/docs/reference/architecture.md`](./docs/src/content/docs/reference/architecture.md)

## Notes

- `bun run dev` and `bun run build` cover the configured Turborepo workspaces.
  The docs site is built separately with `bun run docs:build`.
- The repository currently exposes a root `check-types` command, but no workspace
  packages define a `check-types` task. It is intentionally omitted here until
  it performs a real type-check pass.
