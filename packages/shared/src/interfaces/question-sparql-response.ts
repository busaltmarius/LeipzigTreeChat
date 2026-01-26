import { NamedNode } from "rdf-js";

/**
 * The response of a SPARQL query to the Qanary Question endpoint fetching the question url.
 */
export type QuestionSparqlResponse = {
  questionUri: NamedNode;
};
