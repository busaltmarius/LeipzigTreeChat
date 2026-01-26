import { ErrorRequestHandler } from "express";

import { ErrorResponse } from "./error.model.js";

/**
 * Error handling logic
 * @param err error object
 * @param req request object
 * @param res response object
 * @param next next function
 */
export const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
  const errResponse = ErrorResponse.from(err, req);
  res.status(errResponse.status);
  res.json(errResponse);
  next();
};
