# Qanary Disambiguation Component

This component implements entity disambiguation for the Leipzig Tree Chat project. It resolves ambiguous entity mentions from NER annotations to specific resources in the Baumkataster knowledge graph.

## Overview

The disambiguation component:
1. **Fetches NER annotations** (`AnnotationOfSpotInstance`) created by the NERD component from the Virtuoso triplestore
2. **Extracts exact quotes** from the original question text using position offsets (start/end)
3. **Performs fuzzy matching** using Levenshtein distance against the knowledge base
4. **Creates disambiguation annotations** (`AnnotationOfInstance`) linking entity mentions to specific URNs in the knowledge graph
5. **Supports multiple entity types** with entity-specific configuration and thresholds

## Architecture

```
handler.ts
  └── disambiguateNERResults()
        ├── fetchNerAnnotations()     → reads AnnotationOfSpotInstance from Virtuoso
        ├── disambiguate()            → fuzzy matches against knowledge base (Fuseki)
        └── writeDisambiguationAnnotation() → writes AnnotationOfInstance to Virtuoso
```

### Modules

| File | Description |
|------|-------------|
| `handler.ts` | Main Qanary handler — receives pipeline messages and orchestrates the pipeline |
| `implementation.ts` | Core logic: SPARQL queries, entity fetching, fuzzy matching, annotation writing |
| `entity-types.ts` | Entity type configuration, URI extraction, SPARQL query generation |
| `fuzzy-matching.ts` | Levenshtein distance and normalized similarity calculation |
| `types.ts` | TypeScript type definitions (`NerAnnotation`, `DisambiguationResult`) |

## Key Functions

| Function | Description |
|----------|-------------|
| `fetchNerAnnotations(message, questionUri)` | Queries `AnnotationOfSpotInstance` from Virtuoso, extracts exact quotes via question text fetch |
| `disambiguate(annotation)` | Fuzzy matches entity against knowledge base candidates |
| `writeDisambiguationAnnotation(message, annotation, result)` | Writes `AnnotationOfInstance` back to Virtuoso |
| `extractEntityTypeFromUri(uri)` | Extracts entity type from NER annotation URI (e.g. `urn:leipzigtreechat:entityType:TREE` → `TREE`) |
| `generateEntityQuery(entityType)` | Generates entity-specific SPARQL SELECT query for the knowledge base |

## Supported Entity Types

| Type | Namespace | Identifier | Name Field |
|------|-----------|------------|------------|
| `TREE` | `baumkataster:` | `Species` | `ga_lang_deutsch` |
| `KITA` | `kitas:` | `Kita` | `name_einr` |
| `DISTRICT` | `ortsteile:` | `District` | `Name` |

## Annotation Schema

### Input — `AnnotationOfSpotInstance` (written by NERD component)

```turtle
<urn:qanary:annotation:nerd-XXXX> a qa:AnnotationOfSpotInstance ;
    oa:hasTarget   <urn:qanary:target:XXXX> ;
    oa:hasBody     <urn:leipzigtreechat:entityType:TREE> ;
    oa:score       "0.99"^^xsd:double ;
    oa:annotatedBy <urn:qanary:component:ner> ;
    oa:annotatedAt "..."^^xsd:dateTime .

<urn:qanary:target:XXXX> a oa:SpecificResource ;
    oa:hasSource   <questionUri> ;
    oa:hasSelector <urn:qanary:selector:pos-XXXX> .

<urn:qanary:selector:pos-XXXX> a oa:TextPositionSelector ;
    oa:start "28"^^xsd:nonNegativeInteger ;
    oa:end   "37"^^xsd:nonNegativeInteger .
```

### Output — `AnnotationOfInstance` (written by this component)

```turtle
<urn:qanary:annotation:XXXX> a qa:AnnotationOfInstance ;
    oa:hasBody     <urn:de:leipzig:trees:resource:ortsteile:30> ;
    oa:score       "0.99"^^xsd:double ;
    oa:annotatedBy <urn:qanary:leipzigtreechat:component:disambiguation> ;
    oa:annotatedAt "..."^^xsd:dateTime .
```

## Entity Type URI Format

NER annotations must use the following URI format for `oa:hasBody`:

```
urn:leipzigtreechat:entityType:TYPE
```

Where `TYPE` is one of: `TREE`, `KITA`, `DISTRICT`

## Fuzzy Matching

The component uses **Levenshtein distance** normalized to a similarity score between `0.0` (completely different) and `1.0` (identical):

```
similarity = 1 - (levenshteinDistance / maxLength)
combinedScore = nerConfidence × fuzzySimilarity
```

### Thresholds

| Entity Type | Default Threshold |
|-------------|------------------|
| `TREE` | `0.70` |
| `KITA` | `0.75` |
| `DISTRICT` | `0.60` |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `KNOWLEDGE_BASE_ENDPOINT` | `http://localhost:8000` | Fuseki SPARQL endpoint for domain data |

The Virtuoso triplestore endpoint is read from the incoming Qanary message (`oa:endpoint`).

## Testing

```bash
cd apps/qanary-component-dis
bun test
```

### Test Coverage

| Test File | Coverage |
|-----------|----------|
| `entity-types.spec.ts` | Entity type config, URI extraction, query generation |
| `fuzzy-matching.spec.ts` | Levenshtein distance, similarity scoring |
| `implementation.spec.ts` | Fetch/disambiguate/write with mocked SPARQL |
| `index.spec.ts` | Handler orchestration, error handling |

