---
title: Qanary Annotations
description: Annotation types currently written into the Qanary triplestore by this repository.
---

This page documents the annotation types that are actively written into the
Qanary triplestore by the current components in this repository. The examples
below follow the shape that the code writes today, even where that differs from
older or more idealized examples.

## Prefixes

```turtle
PREFIX qa: <http://www.wdaqua.eu/qa#>
PREFIX qanary: <urn:qanary#>
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
```

## Storage Patterns

The current components use two annotation target patterns:

1. Span-based annotations target a text span inside the stored question. These
   annotations are written through `createAnnotationInKnowledgeGraph` and use an
   `oa:SpecificResource` with an `oa:TextPositionSelector`.
2. Question-level annotations target the question resource directly. These
   annotations are written by manual SPARQL `INSERT` queries and point
   `oa:hasTarget` straight to the question URI.

For the active writers in this repository:

- Span-based: `AnnotationOfSpotInstance`, `AnnotationOfInstance`,
  `AnnotationOfExpectedAnswerType`
- Question-level: `AnnotationOfRelation`, `AnnotationOfAnswerJson`,
  `AnnotationOfClarification`

All current writers store confidence using `oa:score` when a score is present.
`AnnotationOfClarification` currently has no score field.

## 1. `AnnotationOfSpotInstance`

Producer: `qanary-component-nerd-simple`  
Main consumer: `qanary-component-dis`

- `rdf:type`: `qanary:AnnotationOfSpotInstance`
- `oa:hasTarget`: span-based `oa:SpecificResource`
- `oa:hasBody`: JSON string with the detected surface form and entity type
- `oa:score`: NER confidence

```turtle
<urn:qanary:annotation:0.1234> a qanary:AnnotationOfSpotInstance ;
	oa:hasTarget [
		a oa:SpecificResource ;
		oa:hasSource <urn:qanary:question:xyz> ;
		oa:hasSelector [
			a oa:TextPositionSelector ;
			oa:start "12"^^xsd:nonNegativeInteger ;
			oa:end "19"^^xsd:nonNegativeInteger
		]
	] ;
	oa:hasBody "{\"entity\":\"Leipzig\",\"type\":\"CITY\"}" ;
	oa:score "0.99"^^xsd:double ;
	oa:annotatedBy <urn:qanary-component-nerd-simple> ;
	oa:annotatedAt "2026-03-22T10:00:00Z"^^xsd:dateTime .
```

### Supported body values

The NER component stores a JSON object with this shape:

```json
{ "entity": "Leipzig", "type": "CITY" }
```

Entity types currently produced by the NER component include at least:
`TREE`, `KITA`, `DISTRICT`, `STREET`, `STREET_NUMBER`, `ZIP`, and `CITY`.

Current limitation: the disambiguation component only implements downstream
support for `TREE`, `KITA`, and `DISTRICT`.

## 2. `AnnotationOfInstance`

Producer: `qanary-component-dis`  
Main consumer: `qanary-component-sparql-generation`

- `rdf:type`: `qanary:AnnotationOfInstance`
- `oa:hasTarget`: span-based `oa:SpecificResource`
- `oa:hasBody`: resolved entity URN stored as a string literal
- `oa:score`: disambiguation confidence

```turtle
<urn:qanary:annotation:0.5678> a qanary:AnnotationOfInstance ;
	oa:hasTarget [
		a oa:SpecificResource ;
		oa:hasSource <urn:qanary:question:xyz> ;
		oa:hasSelector [
			a oa:TextPositionSelector ;
			oa:start "12"^^xsd:nonNegativeInteger ;
			oa:end "19"^^xsd:nonNegativeInteger
		]
	] ;
	oa:hasBody "urn:leipzig:trees:entity:12345" ;
	oa:score "0.85"^^xsd:double ;
	oa:annotatedBy <urn:leipzigtreechat:component:disambiguation> ;
	oa:annotatedAt "2026-03-22T10:00:01Z"^^xsd:dateTime .
```

The body is not stored as an RDF IRI node. It is stored as a string literal and
later read back as text.

## 3. `AnnotationOfExpectedAnswerType`

Producer: `qanary-component-eat-simple`

- `rdf:type`: `qanary:AnnotationOfExpectedAnswerType`
- `oa:hasTarget`: span-based `oa:SpecificResource` covering the full question
- `oa:hasBody`: Qanary EAT URI stored as a string literal
- `oa:score`: classifier confidence

```turtle
<urn:qanary:annotation:0.9012> a qanary:AnnotationOfExpectedAnswerType ;
	oa:hasTarget [
		a oa:SpecificResource ;
		oa:hasSource <urn:qanary:question:xyz> ;
		oa:hasSelector [
			a oa:TextPositionSelector ;
			oa:start "0"^^xsd:nonNegativeInteger ;
			oa:end "42"^^xsd:nonNegativeInteger
		]
	] ;
	oa:hasBody "urn:qanary:eat#number" ;
	oa:score "0.92"^^xsd:double ;
	oa:annotatedBy <urn:qanary-component-eat-simple> ;
	oa:annotatedAt "2026-03-22T10:00:02Z"^^xsd:dateTime .
```

### Supported body values

The EAT component maps the following values into the `urn:qanary:eat#...`
namespace:

- `object`
- `list`
- `number`
- `bool`
- `string`
- `datetime`
- `date`
- `time`
- `timestamp`
- `enumeration`

## 4. `AnnotationOfRelation`

Producer: `qanary-component-relation-detection`  
Main consumer: `qanary-component-sparql-generation`

- `rdf:type`: `qanary:AnnotationOfRelation`
- `oa:hasTarget`: question URI directly
- `oa:hasBody`: uppercase relation type string
- `oa:score`: classifier confidence

```turtle
<urn:qanary:annotation:relation-1111> a qanary:AnnotationOfRelation ;
	oa:hasTarget <urn:qanary:question:xyz> ;
	oa:hasBody "AMOUNT_WATERED_DISTRICT"^^xsd:string ;
	oa:score "0.92"^^xsd:double ;
	oa:annotatedBy <urn:leipzigtreechat:component:relation-detection> ;
	oa:annotatedAt "2026-03-22T10:00:03Z"^^xsd:dateTime .
```

### Supported body values

- `UNKNOWN`
- `AMOUNT_WATERED_DISTRICT`
- `AMOUNT_SPONSORED_TREES`
- `WATERABLE_TREES_AT_ADDRESS`
- `TREES_BY_SPECIES_DISTRICT`
- `WATERABLE_TREES_AT_KITA`

The body is currently a string literal, not a relation URI.

## 5. `AnnotationOfAnswerJson`

Producer: `qanary-component-sparql-generation`  
Main consumer: `chatbot` triplestore service

- `rdf:type`: `qanary:AnnotationOfAnswerJson`
- `oa:hasTarget`: question URI directly
- `oa:hasBody`: serialized SPARQL JSON result as a string literal
- `oa:score`: currently always written as `1.0`

```turtle
<urn:qanary:annotation:ans-2222> a qanary:AnnotationOfAnswerJson ;
	oa:hasTarget <urn:qanary:question:xyz> ;
	oa:hasBody "{\"head\":{\"vars\":[\"tree\"]},\"results\":{\"bindings\":[{\"tree\":{\"type\":\"uri\",\"value\":\"http://example.org/tree/123\"}}]}}"^^xsd:string ;
	oa:score "1.0"^^xsd:double ;
	oa:annotatedBy <urn:leipzigtreechat:component:query_builder> ;
	oa:annotatedAt "2026-03-22T10:00:04Z"^^xsd:dateTime .
```

The body contains the final answer payload returned from the generated SPARQL
query, stored as JSON text.

## 6. `AnnotationOfClarification`

Producers: currently written by clarification flows in
`qanary-component-dis`, `qanary-component-eat-simple`, and
`qanary-component-relation-detection`  
Main consumer: `chatbot` triplestore service

- `rdf:type`: `qanary:AnnotationOfClarification`
- `oa:hasTarget`: question URI directly
- `oa:hasBody`: clarification question text
- score: not currently stored

```turtle
<urn:qanary:annotation:clarification-3333> a qanary:AnnotationOfClarification ;
	oa:hasBody """Did you mean the oak near the lake or the oak in the city center?""" ;
	oa:hasTarget <urn:qanary:question:xyz> ;
	oa:annotatedBy <urn:qanary-component-relation-detection> ;
	oa:annotatedAt "2026-03-22T10:00:05Z"^^xsd:dateTime .
```

The current helper writes the clarification body as plain text and does not add
`oa:score`.

## Notes and Current Limitations

- The current repository uses `oa:score` for scored annotations. Older docs or
  examples that show `qa:score` do not match the active writers.
- The active writers in this repository use `urn:qanary#...` annotation class
  IRIs. Older Qanary examples that use the WDAqua `qa:` namespace for
  annotation classes do not match the current stored shape here.
- `AnnotationOfExpectedAnswerType` is the active EAT annotation type in this
  codebase. `AnnotationOfAnswerType` is not what the current EAT component
  writes.
- Several bodies that conceptually reference URIs are still stored as string
  literals rather than RDF IRI nodes. This applies to at least
  `AnnotationOfInstance` and `AnnotationOfExpectedAnswerType`.
- The span-based helper currently writes only `oa:TextPositionSelector`. It
  does not persist `oa:TextQuoteSelector`.
- `AnnotationOfClarification` is intentionally documented without a score,
  because the active writer does not store one.
