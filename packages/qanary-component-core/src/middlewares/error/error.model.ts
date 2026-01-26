import type { QanaryComponentApi } from "@leipzigtreechat/qanary-api";
import type { Request } from "express";

/**
 * An error response as it can be processed by the Qanary pipeline
 */
export class ErrorResponse implements QanaryComponentApi.IQanaryComponentError {
  /**
   * A timestamp when the error has occurred
   */
  public timestamp: string;
  /**
   * The status code of the error
   */
  public status: number;
  /**
   * The error message
   */
  public error: string;
  /**
   * The endpoint where error has occurred
   */
  public path: string;

  /**
   * The function to instantiate the object
   * @param options The options that can be passed to the object
   * @private
   */
  private constructor(options: QanaryComponentApi.IQanaryComponentError) {
    this.timestamp = options.timestamp || new Date().toISOString();
    this.status = options.status || 500;
    this.error = options.error || "";
    this.path = options.path || "";
  }

  /**
   * The factory method of the object
   * @param err the error object
   * @param req the request object
   */
  static from(err: Error, req: Request) {
    return new ErrorResponse({
      path: req.path,
      status: 500,
      error: err.message,
    });
  }
}
