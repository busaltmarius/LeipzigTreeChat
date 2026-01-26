import { RequestHandler } from "express";

/**
 * Request handler for the "/health" endpoint
 */
export const readHealth = async (): Promise<RequestHandler> => {
  return async (req, res) => {
    res.status(200).json({
      status: "UP",
    });
  };
};
