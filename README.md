# LeipzigTreeChat

A Turborepo monorepo containing a chatbot application with CLI and web interfaces.

## Requirements

- [Bun](https://bun.sh/) >= 1.3.2

## Apps and Packages

### Apps

| App       | Description                            | Technologies                 |
| --------- | -------------------------------------- | ---------------------------- |
| `chatcli` | Command-line interface for the chatbot | Bun, Effect, LangChain       |
| `chatui`  | Web-based chat interface               | SvelteKit, Vite, TailwindCSS |

### Packages

| Package                              | Description                                                   |
| ------------------------------------ | ------------------------------------------------------------- |
| `@leipzigtreechat/chatbot`           | Core chatbot logic shared by apps (LangGraph, Effect, AI SDK) |
| `@leipzigtreechat/typescript-config` | Shared TypeScript configurations                              |

## Installation

1. Clone the repository:

```sh
git clone <repository-url>
cd LeipzigTreeChat
```

2. Install dependencies:

```sh
bun install
```

## Development

Start all apps and packages in development mode:

```sh
bun run dev
```

Start a specific app:

```sh
# Chat UI
bun run dev --filter=chatui

# Chat CLI
bun run dev --filter=chatcli
```

## Building

Build all apps and packages:

```sh
bun run build
```

Build a specific app or package:

```sh
# Build chatui
bun run build --filter=chatui

# Build chatbot package
bun run build --filter=@leipzigtreechat/chatbot
```

## Other Commands

| Command                       | Description                             |
| ----------------------------- | --------------------------------------- |
| `bun run format-and-lint`     | Check formatting and linting with Biome |
| `bun run format-and-lint:fix` | Fix formatting and linting issues       |
| `bun run check-types`         | Run TypeScript type checking            |

## Code Style

### Effect

This project uses [Effect](https://effect.website/) for type-safe functional programming. Key patterns:

- Use `Effect.gen` with generators for sequential operations
- Use `Context.Tag` and `Layer` for dependency injection
- Use `Effect.fail` with tagged errors for typed error handling
- Use `Effect.pipe` for composing effects

Example:

```ts
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const result = yield* someEffect();
  return result;
});

program.pipe(
  Effect.catchTag("MyError", handleError),
  Effect.provide(MyService.Live),
);
```

### Formatting

- [Biome](https://biomejs.dev/) for formatting and linting
- Run `bun run format-and-lint:fix` to auto-fix issues
- [Editor integration](https://biomejs.dev/guides/editors/first-party-extensions/)

## Utilities

This monorepo uses:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for code formatting and linting
- [Turborepo](https://turborepo.com/) for monorepo task orchestration
- [Effect](https://effect.website/) for type-safe functional programming
