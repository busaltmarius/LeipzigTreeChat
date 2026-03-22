# chatcli

`chatcli` is the terminal interface for the shared Baumbart chatbot runtime. It
uses the same core conversation graph as the web frontend, but reads and writes
messages in a local shell session.

## Scripts

Run these commands from `apps/chatcli`:

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the CLI directly from `src/index.ts` |
| `bun run build` | Compile the CLI binary to `dist/baumbart-cli` |

From the repository root you can also start it via Turborepo:

```sh
bun run dev --filter=chatcli
```

After building, the compiled executable is written to:

```text
dist/baumbart-cli
```

## Environment

Copy the example file before local development:

```sh
cp apps/chatcli/.env.example apps/chatcli/.env
```

Required variables from
[`apps/chatcli/.env.example`](./.env.example):

- `OPENROUTER_API_KEY`: OpenRouter key used by the chatbot runtime
- `QANARY_API_BASE_URL`: base URL of the local Qanary pipeline, usually
  `http://localhost:8080`
- `TRIPLESTORE_URL`: Virtuoso SPARQL endpoint used for Qanary annotations,
  usually `http://localhost:8890/sparql`

## Runtime Dependencies

The CLI shares the same backend dependencies as `chatui`:

- the Qanary pipeline
- the Virtuoso triplestore
- the Leipzig tree knowledge graph
- a valid OpenRouter API key

Use it when you want to verify the chatbot without opening the browser or when
you want a terminal-driven local workflow.

## Related Docs

- Local setup guide:
  [`../../docs/src/content/docs/guides/getting-started.md`](../../docs/src/content/docs/guides/getting-started.md)
- Repo overview: [`../../README.md`](../../README.md)
