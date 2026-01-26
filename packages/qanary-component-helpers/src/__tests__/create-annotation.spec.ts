import type { IQanaryMessage } from "../api.js";

import { createAnnotationInKnowledgeGraph, type IAnnotationInformation } from "../create-annotation.js";

import { updateSparql } from "../query-sparql.js";

jest.mock("../query-sparql", () => ({
  updateSparql: jest.fn(() => Promise.resolve()),
  selectSparql: jest.fn(() => Promise.resolve([{ questionUrl: { value: "qanary-question-uri" } }])),
}));

jest.mock("../get-question-uri", () => ({
  getQuestionUri: jest.fn(() => Promise.resolve("qanary-question-uri")),
}));

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

  it("should create an annotation", async () => {
    const mockUpdateSparql = jest.fn();
    (updateSparql as jest.Mock) = mockUpdateSparql;

    await createAnnotationInKnowledgeGraph({ message: qanaryMessage, componentName: "test", annotation });

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

  it("should create an annotation with a custom annotation type", async () => {
    const annotationType = "qa:AnnotationOfStation";
    const mockUpdateSparql = jest.fn();
    (updateSparql as jest.Mock) = mockUpdateSparql;

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

  it("should only log an error if one occurs", async () => {
    console.error = jest.fn();
    (updateSparql as jest.Mock) = jest.fn(() => Promise.reject("error"));

    await createAnnotationInKnowledgeGraph({ message: qanaryMessage, componentName: "test", annotation });

    expect(console.error).toHaveBeenCalled();
  });
});
