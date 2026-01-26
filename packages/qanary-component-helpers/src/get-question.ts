import type { IQanaryMessage } from "./api.js";

import { getQuestionUri } from "./get-question-uri.js";

/**
 * Fetches the raw question from given question url
 * @param questionUrl the url of the question
 * @param origin the origin for the question request, e.g the origin of qanary pipeline
 * @returns the raw question
 */
const fetchRawQuestion = async (questionUrl: string, origin?: string) => {
  const url: URL = new URL(questionUrl);

  // adjust url to match the origin of the qanary pipeline (e.g. in containerized environments)
  const adjustedUrl: string = origin ? `${origin}${url.pathname}/raw` : `${questionUrl}/raw`;

  const response = await fetch(adjustedUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.text();
};

/**
 * Gets the question from the graph given in the message
 * @param message the message containing the graph and endpoint
 * @param origin the origin for the question request, e.g the origin of qanary pipeline
 * @returns the asked question
 */
export const getQuestion = async (message: IQanaryMessage, origin?: string): Promise<string | null> => {
  try {
    const questionUri: string = (await getQuestionUri(message)) ?? "";

    return await fetchRawQuestion(questionUri, origin);
  } catch (error) {
    console.error(error);
    return null;
  }
};
