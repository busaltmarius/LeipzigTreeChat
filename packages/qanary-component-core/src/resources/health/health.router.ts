import type { Router as RouterType } from "express";
import { Router } from "express";

import { readHealth } from "./health.controller.js";

/**
 * The heatlh router for a qanary component
 */
export const healthRouter = async (): Promise<RouterType> => {
  const router = Router();

  router.get(["/"], await readHealth());

  return router;
};
