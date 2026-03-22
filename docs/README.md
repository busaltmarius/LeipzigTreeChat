# Baumbart Docs

This package contains the Baumbart documentation site built with Astro
Starlight.

## Where To Run Commands

Use package-local commands from `docs/`:

```sh
cd docs
bun run dev
bun run build
bun run preview
```

Use repository-root commands when you want to regenerate the source-reference
pages first:

```sh
bun run docs:reference
bun run docs:build
```

## What Gets Generated

The source-code reference pages under
[`docs/src/content/docs/source-code/`](./src/content/docs/source-code/)
are generated from workspace TSDoc output and
[`scripts/generate-source-reference.mjs`](../scripts/generate-source-reference.mjs).

`bun run docs:reference` performs the generation step only.

`bun run docs:build` regenerates the reference pages and then builds the
Starlight site.

## Content Layout

- [`src/content/docs/guides/`](./src/content/docs/guides/): authored guides such
  as local setup
- [`src/content/docs/reference/`](./src/content/docs/reference/): authored
  reference material for architecture, annotations, and example flows
- [`src/content/docs/source-code/`](./src/content/docs/source-code/): generated
  source-code reference pages
- [`src/assets/`](./src/assets/): images used by the docs site

## Related Files

- Repo entrypoint: [`../README.md`](../README.md)
- Local setup guide:
  [`src/content/docs/guides/getting-started.md`](./src/content/docs/guides/getting-started.md)
- Architecture reference:
  [`src/content/docs/reference/architecture.md`](./src/content/docs/reference/architecture.md)
