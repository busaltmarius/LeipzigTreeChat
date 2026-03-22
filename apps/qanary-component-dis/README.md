# Qanary Disambiguation Component

This component resolves ambiguous entity mentions from NER annotations to
concrete resources in the Leipzig tree knowledge graph.

## Overview

The current component flow is:

1. Read `AnnotationOfSpotInstance` annotations from the Qanary graph in
   Virtuoso.
2. Fetch the original question text and reconstruct the exact entity quote from
   the annotation offsets.
3. Parse the annotation `spotBody` payload and read `parsed.type` as the entity
   type.
4. Fuzzy-match the extracted quote against candidates from the domain knowledge
   graph.
5. Write `AnnotationOfInstance` annotations for successful matches.
6. Generate clarification annotations when multiple candidates remain above the
   fuzzy threshold.

URI-based entity-type parsing still exists as a backward-compatible fallback,
but the current primary path expects a JSON body with a `type` field.

## Architecture

```text
handler.ts
  -> fetchNerAnnotations()
  -> disambiguate()
  -> writeDisambiguationAnnotation()
  -> create clarification annotation for ambiguous results
```

## Modules

| File | Description |
| --- | --- |
| `handler.ts` | Main Qanary handler and clarification flow orchestration |
| `implementation.ts` | Annotation fetching, candidate lookup, scoring, and write-back |
| `entity-types.ts` | Supported entity types and SPARQL query generation |
| `fuzzy-matching.ts` | Levenshtein distance and normalized similarity helpers |
| `types.ts` | Shared TypeScript types for annotations and disambiguation results |

## Supported Entity Types

| Type | Namespace | Identifier | Label Field |
| --- | --- | --- | --- |
| `TREE` | `baumkataster:` | `Species` | `ga_lang_deutsch` |
| `KITA` | `kitas:` | `Kita` | `name_einr` |
| `DISTRICT` | `ortsteile:` | `District` | `Name` |

## Input And Output

### Input

The component reads `qa:AnnotationOfSpotInstance` annotations from the current
Qanary graph. In the current implementation, `oa:hasBody` is expected to be a
JSON payload whose `type` property contains the entity type, for example:

```json
{"type":"TREE"}
```

The component also reads the `oa:start` and `oa:end` selector offsets and fetches
the question text to reconstruct the exact quote.

If the body is not JSON, the component still attempts to extract the entity type
from the older URI form `urn:leipzigtreechat:entityType:TYPE`.

### Output

Successful matches are written back as `qa:AnnotationOfInstance` annotations.

If more than one candidate remains above the threshold, the handler also creates
a clarification annotation so downstream conversation logic can ask the user
which entity they meant.

## Fuzzy Matching

The component uses normalized Levenshtein similarity:

```text
similarity = 1 - (levenshteinDistance / maxLength)
```

The effective score written by the current implementation is the fuzzy
similarity only. The older idea of combining NER confidence with fuzzy
similarity is not currently active in the code.

### Thresholds

| Entity Type | Threshold |
| --- | --- |
| `TREE` | `0.70` |
| `KITA` | `0.75` |
| `DISTRICT` | `0.60` |

## Configuration

### Hardcoded In Code

The current implementation hardcodes the data endpoints:

- Virtuoso SPARQL endpoint: `http://localhost:8890/sparql/`
- Knowledge graph endpoint: `http://localhost:8000`

These values are not currently read from environment variables.

### Environment File

For local development, copy the example file first:

```sh
cp apps/qanary-component-dis/.env.example apps/qanary-component-dis/.env
```

The example file defines runtime and registration settings such as:

- `SPRING_BOOT_ADMIN_URL`
- `QANARY_HOST`
- `QANARY_PORT`
- `OPENROUTER_API_KEY`

When the Qanary pipeline runs in Docker and this component runs on the host
machine, use:

```sh
QANARY_HOST=host.docker.internal
```

If `QANARY_HOST=localhost`, the container will try to call itself instead of
your locally running component.

## Local Development

Run the component from the package directory:

```sh
bun run dev
```

This loads `.env` via the package script and starts the component in watch mode.

For the full local stack, including Docker services and the other components,
use the repository setup guide:

[`../../docs/src/content/docs/guides/getting-started.md`](../../docs/src/content/docs/guides/getting-started.md)

## Testing

Run tests from the package directory:

```sh
bun test
```

Current coverage includes:

| Test File | Focus |
| --- | --- |
| `entity-types.spec.ts` | Entity type config, URI extraction, and query generation |
| `fuzzy-matching.spec.ts` | Levenshtein distance and similarity scoring |
| `implementation.spec.ts` | Fetch, disambiguate, and annotation write-back |
| `handler-clarification.spec.ts` | Clarification generation for ambiguous matches |
| `index.spec.ts` | Handler orchestration and error handling |
