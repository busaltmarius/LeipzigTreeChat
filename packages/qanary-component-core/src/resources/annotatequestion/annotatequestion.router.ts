import type { Router as RouterType } from "express";
import { Router } from "express";

import { createAnnotateQuestion } from "./annotatequestion.controller.js";
import type { IQanaryComponentMessageHandler } from "./annotatequestion.model.js";

/**
 * The parameterized router for the annotatequestion resource
 */
export const annotateQuestionRouter = async (handler: IQanaryComponentMessageHandler): Promise<RouterType> => {
  const router = Router();

  router.post(["/"], await createAnnotateQuestion(handler));

  return router;
};
