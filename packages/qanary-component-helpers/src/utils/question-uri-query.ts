/**
 * Gets the sparql query for the question uri
 * @param inGraph the graph to get the question uri from
 * @returns the sparql query to get the question uri
 */
export const getQuestionUriQuery = (inGraph: string) => `
PREFIX qa: <http://www.wdaqua.eu/qa#>

SELECT ?questionUri
FROM <${inGraph}>
WHERE {
  ?questionUri a qa:Question.
}
LIMIT 1`;
