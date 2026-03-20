---
title: Qanary Annotations
description: All custom annotations we introduced for our Qanary Pipeline.
---

# 1. NER

```turtle
<urn:qanary:annotation:ner-1111> a qa:AnnotationOfSpotInstance ;
    oa:hasTarget <urn:qanary:specificResource:spot-2222> ;
    oa:hasBody <urn:leipzigtreechat:entityType:TREE> ;
    qa:score "0.98"^^xsd:double ;
    oa:annotatedBy <urn:leipzigtreechat:component:ner> ;
    oa:annotatedAt "2026-03-04T20:00:00Z"^^xsd:dateTime .

<urn:qanary:specificResource:spot-2222> a oa:SpecificResource ;
    oa:hasSource <urn:qanary:question:xyz> ;
    oa:hasSelector <urn:qanary:selector:pos-3333>, <urn:qanary:selector:quote-4444> .

<urn:qanary:selector:pos-3333> a oa:TextPositionSelector ;
    oa:start "12"^^xsd:nonNegativeInteger ;
    oa:end "17"^^xsd:nonNegativeInteger .

<urn:qanary:selector:quote-4444> a oa:TextQuoteSelector ;
    oa:exact "Eiche"^^xsd:string .
```

Mögliche Entities types:
TREE, KITA, DISTRICT, ZIP, CITY, JAHR (falls euch noch weitere einfallen, kann das noch erweitert werden)

# 2. Disambiguation

```turtle
<urn:qanary:annotation:dis-5555> a qa:AnnotationOfInstance ;
    oa:hasTarget <urn:qanary:specificResource:spot-2222> ;
    oa:hasBody [http://leipzig.data.de/tree/Quercus_Robur];
    qa:score "0.85"^^xsd:double ;
    oa:annotatedBy <urn:leipzigtreechat:component:disambiguation> ;
    oa:annotatedAt "2026-03-04T20:00:01Z"^^xsd:dateTime .
```

Hier steht im Body der Identifier der tatsächlichen gefundenen Entität

# 3. Expected Answer Type (EAT)

```turtle
<urn:qanary:annotation:eat-6666> a qa:AnnotationOfAnswerType ;
    oa:hasTarget <urn:qanary:question:xyz> ;
    oa:hasBody "Aufzaehlung"^^xsd:string ;
    qa:score "0.99"^^xsd:double ;
    oa:annotatedBy <urn:leipzigtreechat:component:eat> ;
    oa:annotatedAt "2026-03-04T20:00:02Z"^^xsd:dateTime .
```

Mögliche EATs: Datum, Aufzaehlung, Zahl, Objekt, Bool (falls euch noch weitere einfallen, kann das noch erweitert werden)

# 4. Intent Classification

```turtle
<urn:qanary:annotation:intent-7777> a qa:AnnotationOfRelation ;
    oa:hasTarget <urn:qanary:question:xyz> ;
    oa:hasBody <urn:leipzigtreechat:intent:WATER_TREE_NEARBY> ;
    qa:score "0.92"^^xsd:double ;
    oa:annotatedBy <urn:leipzigtreechat:component:intent> ;
    oa:annotatedAt "2026-03-04T20:00:03Z"^^xsd:dateTime .
```

Mögliche Intents: WATER_TREE_NEARBY, WATER_TREE_AT_ADDRESS, TREES_NEARBY usw.

# 5. Query Builder (Execution Result)

```turtle
<urn:qanary:annotation:ans-8888> a qa:AnnotationOfAnswerJson ;
    oa:hasTarget <urn:qanary:question:xyz> ;
    oa:hasBody "{\"head\":{\"vars\":[\"tree\"]},\"results\":{\"bindings\":[{\"tree\":{\"type\":\"uri\",\"value\":\"[http://leipzig.data.de/tree/123](http://leipzig.data.de/tree/123)\"}}]}}"^^xsd:string ;
    qa:score "1.0"^^xsd:double ;
    oa:annotatedBy <urn:leipzigtreechat:component:query_builder> ;
    oa:annotatedAt "2026-03-04T20:00:04Z"^^xsd:dateTime .
```

Hier soll in den Body die Antwort, die man aus der endgültigen Abfrage aus der Datenbank kommt.

# 6. Clarification

```turtle
<urn:qanary:annotation:clarification-9999> a qa:AnnotationOfClarification ;
    oa:hasTarget <urn:qanary:question:xyz> ;
    oa:hasBody "Meinten Sie die Eiche im Zentrum oder am See?"^^xsd:string ;
    qa:score "0.45"^^xsd:double ;
    oa:annotatedBy <urn:leipzigtreechat:component:disambiguation> ;
    oa:annotatedAt "2026-03-04T20:28:46Z"^^xsd:dateTime .
```

Hier soll im Body gespeichtert werden, was genau noch unklar ist und nachgefragt werden muss.

Um die Annotations korrekt einzufügen braucht ihr noch diese Präfixe:

```turtle
PREFIX qa: <http://www.wdaqua.eu/qa#>
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
```
