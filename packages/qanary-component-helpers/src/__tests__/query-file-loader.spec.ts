import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs";

import { queryFileLoader, RESERVED_KEYWORD_IN_SPARQL_QUERY } from "../query-file-loader.js";

describe("queryFileLoader", () => {
  test("should return an untransformed query", () => {
    const originalText = `SELECT *
                          FROM <YOUR_CURRENT_GRAPH_ID>
                          WHERE { ?annotation a qa:AnnotationOfQuestionLanguage.?annotation oa:hasBody ?languageCode.}`;

    const transformedText = originalText;

    spyOn(fs, "readFileSync").mockReturnValueOnce(originalText);
    const actualQuery = queryFileLoader("", []);
    expect(actualQuery).toEqual(transformedText);
  });

  test("should return a transformed query", () => {
    const originalText = `SELECT *
                          FROM <YOUR_CURRENT_GRAPH_ID>
                          WHERE { ?annotation a qa:AnnotationOfQuestionLanguage.?annotation oa:hasBody ?languageCode.}`;

    const transformedText = `SELECT *
                          FROM <Test>
                          WHERE { ?annotation a qa:AnnotationOfQuestionLanguage.?annotation oa:hasBody ?languageCode.}`;

    spyOn(fs, "readFileSync").mockReturnValueOnce(originalText);
    const actualQuery = queryFileLoader("", [
      {
        keyword: RESERVED_KEYWORD_IN_SPARQL_QUERY.YOUR_CURRENT_GRAPH_ID,
        replacement: "Test",
      },
    ]);
    expect(actualQuery).toEqual(transformedText);
  });
});
