import { type RequestHandler, Router } from "express";

import { readAbout } from "./about.controller.js";

/**
 * The about router for a qanary component
 */
export const aboutRouter = async (): Promise<RequestHandler> => {
  const router = Router();

  router.get(["/", "/about"], await readAbout());

  return router;
};
