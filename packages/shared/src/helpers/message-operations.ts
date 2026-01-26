import type { QanaryComponentApi } from "@leipzigtreechat/qanary-api";

/**
 * Gets the endpoint attribute from the message
 * @param message the message received from the qanary pipeline
 * @returns the endpoint attribute
 */
export const getEndpoint = (message: QanaryComponentApi.IQanaryMessage): string | undefined => {
  return message.endpoint;
};

/**
 * Gets the inGraph attribute from the message
 * @param message the message received from the qanary pipeline
 * @returns the inGraph attribute
 */
export const getInGraph = (message: QanaryComponentApi.IQanaryMessage): string | undefined => {
  return message.inGraph;
};

/**
 * Gets the outGraph attribute from the message
 * @param message the message received from the qanary pipeline
 * @returns the outGraph attribute
 */
export const getOutGraph = (message: QanaryComponentApi.IQanaryMessage): string | undefined => {
  return message.outGraph;
};
