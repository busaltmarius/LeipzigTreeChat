import type { RequestHandler } from "express";

import { QanaryComponentAbout } from "./about.model.js";

/**
 * Request handler for the "/about" endpoint
 */
export const readAbout = async (): Promise<RequestHandler> => {
  return async (_req, res) => {
    const qanaryComponentAbout = await QanaryComponentAbout.create();
    res.status(200).json(qanaryComponentAbout);
  };
};
