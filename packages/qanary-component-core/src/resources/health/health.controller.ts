import type { RequestHandler } from "express";

/**
 * Request handler for the "/health" endpoint
 */
export const readHealth = async (): Promise<RequestHandler> => {
  return async (_req, res) => {
    res.status(200).json({
      status: "UP",
    });
  };
};
