import { getEndpoint, getInGraph } from "../helpers/message-operations.js";
import { selectSparql } from "../helpers/query-sparql.js";
import { getQuestionUriQuery } from "../helpers/question-uri-query.js";
import type { IQanaryMessage } from "../interfaces/qanary-interfaces.js";
import type { QuestionSparqlResponse } from "../interfaces/question-sparql-response.js";

/**
 * Gets the question uri from the graph given in the message
 * @param message the message containing the graph and endpoint
 * @returns the uri of the question
 */
export const getQuestionUri = async (message: IQanaryMessage): Promise<string | null> => {
  const inGraph: string = getInGraph(message) ?? "";
  const endpointUrl: string = getEndpoint(message) ?? "";
  const questionUriQuery = getQuestionUriQuery(inGraph);

  try {
    const response = await selectSparql<QuestionSparqlResponse>(endpointUrl, questionUriQuery);
    const firstResponse = 0;

    return response[firstResponse]?.questionUri.value ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
