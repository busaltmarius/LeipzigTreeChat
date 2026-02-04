import { describe, expect, test } from "bun:test";
import { getQuestionUriQuery } from "../utils/question-uri-query.js";

describe("getQuestionUriQuery", () => {
  test("should return the correct query", () => {
    const inGraph = "http://example.org/graph";
    const expectedQuery = `
PREFIX qa: <http://www.wdaqua.eu/qa#>

SELECT ?questionUri
FROM <${inGraph}>
WHERE {
  ?questionUri a qa:Question.
}
LIMIT 1`;
    const actualQuery = getQuestionUriQuery(inGraph);

    expect(actualQuery).toEqual(expectedQuery);
  });
});
