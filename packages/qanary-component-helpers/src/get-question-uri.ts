import type { IQanaryMessage } from "./api.js";

import type { QuestionSparqlResponse } from "./interfaces/question-sparql-response.js";
import { getEndpoint, getInGraph } from "./message-operations.js";
import { selectSparql } from "./query-sparql.js";
import { getQuestionUriQuery } from "./utils/question-uri-query.js";

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
