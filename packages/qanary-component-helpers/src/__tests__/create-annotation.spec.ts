import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { IQanaryMessage } from "../api.js";

import { createAnnotationInKnowledgeGraph, type IAnnotationInformation } from "../create-annotation.js";

import { updateSparql } from "../query-sparql.js";

beforeEach(() => {
    mock.module("../query-sparql.js", () => ({
        updateSparql: mock(() => Promise.resolve()),
        selectSparql: mock(() => Promise.resolve([{ questionUrl: { value: "qanary-question-uri" } }])),
    }));

    mock.module("../get-question-uri.js", () => ({
        getQuestionUri: mock(() => Promise.resolve("qanary-question-uri")),
    }));
});

afterEach(() => {
    mock.restore();
    mock.clearAllMocks();
});

describe("createAnnotationInKnowledgeGraph", () => {
  const qanaryMessage: IQanaryMessage = {
    endpoint: "http://qanary-pipeline:40111/sparql",
    inGraph: "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd",
    outGraph: "urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd",
  };

  const annotation: IAnnotationInformation = {
    value: "Berlin",
    confidence: 0.9,
    range: {
      start: 0,
      end: 6,
    },
  };

  test("should create an annotation", async () => {
    const mockUpdateSparql = mock();
    // @ts-expect-error - mocking module
    updateSparql.mockImplementation(mockUpdateSparql);

    await createAnnotationInKnowledgeGraph({
      message: qanaryMessage,
      componentName: "test",
      annotation,
    });

    const expectedQuery = `
PREFIX qa: <http://www.wdaqua.eu/qa#>
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT {
    GRAPH <urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd> {
        ?annotation a qa:AnnotationAnswer .
        ?annotation oa:hasTarget [
            a oa:SpecificResource ;
            oa:hasSource <qanary-question-uri> ;
            oa:hasSelector [
                a oa:TextPositionSelector ;
                oa:start '0'^^xsd:nonNegativeInteger ;
                oa:end '6'^^xsd:nonNegativeInteger
            ]
        ] ;
            oa:hasBody 'Berlin' ;
            oa:score '0.9'^^xsd:double ;
            oa:annotatedBy <urn:qanary:test> ;
            oa:annotatedAt ?time .
    }
}
WHERE {
    BIND (IRI(str(RAND())) AS ?annotation)
    BIND (now() as ?time)
}`;

    expect(mockUpdateSparql).toHaveBeenCalledWith(qanaryMessage.endpoint, expectedQuery);
  });

  test("should create an annotation with a custom annotation type", async () => {
    const annotationType = "qa:AnnotationOfStation";
    const mockUpdateSparql = mock();
    // @ts-expect-error - mocking module
    updateSparql.mockImplementation(mockUpdateSparql);

    await createAnnotationInKnowledgeGraph({
      message: qanaryMessage,
      componentName: "test",
      annotation,
      annotationType,
    });

    const expectedQuery = `
PREFIX qa: <http://www.wdaqua.eu/qa#>
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT {
    GRAPH <urn:graph:e8fe00d7-2a1b-4978-acef-af893cd287dd> {
        ?annotation a ${annotationType} .
        ?annotation oa:hasTarget [
            a oa:SpecificResource ;
            oa:hasSource <qanary-question-uri> ;
            oa:hasSelector [
                a oa:TextPositionSelector ;
                oa:start '0'^^xsd:nonNegativeInteger ;
                oa:end '6'^^xsd:nonNegativeInteger
            ]
        ] ;
            oa:hasBody 'Berlin' ;
            oa:score '0.9'^^xsd:double ;
            oa:annotatedBy <urn:qanary:test> ;
            oa:annotatedAt ?time .
    }
}
WHERE {
    BIND (IRI(str(RAND())) AS ?annotation)
    BIND (now() as ?time)
}`;

    expect(mockUpdateSparql).toHaveBeenCalledWith(qanaryMessage.endpoint, expectedQuery);
  });

  test("should only log an error if one occurs", async () => {
    const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
    // @ts-expect-error - mocking module
    updateSparql.mockImplementation(() => Promise.reject("error"));

    await createAnnotationInKnowledgeGraph({
      message: qanaryMessage,
      componentName: "test",
      annotation,
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
