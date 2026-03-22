# chatui

`chatui` is the SvelteKit and Vite web frontend for Baumbart. It loads the
current chat session, exposes the initial message history, and connects the
browser UI to the chatbot runtime over websockets.

## Scripts

Run these commands from `apps/chatui`:

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the local development server |
| `bun run build` | Build the frontend |
| `bun run preview` | Preview the production build locally |
| `bun run check` | Run `svelte-check` with the app TypeScript config |
| `bun run check:watch` | Run `svelte-check` in watch mode |

From the repository root you can also start the app as part of the workspace
development flow:

```sh
bun run dev --filter=chatui
```

## Environment

Copy the example file before local development:

```sh
cp apps/chatui/.env.example apps/chatui/.env
```

Required variables from
[`apps/chatui/.env.example`](./.env.example):

- `OPENROUTER_API_KEY`: OpenRouter key used by the chatbot runtime
- `QANARY_API_BASE_URL`: base URL of the local Qanary pipeline, usually
  `http://localhost:8080`
- `TRIPLESTORE_URL`: Virtuoso SPARQL endpoint used for Qanary annotations,
  usually `http://localhost:8890/sparql`

## Runtime Dependencies

`chatui` depends on the rest of the Baumbart stack being available:

- the Qanary pipeline on `http://localhost:8080`
- the Virtuoso triplestore on `http://localhost:8890`
- the Leipzig tree knowledge graph on `http://localhost:8000`
- a valid OpenRouter API key for the LLM-backed parts of the chatbot

For the full local setup, use the repository guide in
[`../../docs/src/content/docs/guides/getting-started.md`](../../docs/src/content/docs/guides/getting-started.md).

## Current Session Behavior

Chat sessions are identified by a cookie, but the actual chat state is stored
in-process in the server runtime. Session state is not shared across instances
and does not survive a process restart.

## Related Docs

- Architecture:
  [`../../docs/src/content/docs/reference/architecture.md`](../../docs/src/content/docs/reference/architecture.md)
- Repo overview: [`../../README.md`](../../README.md)
