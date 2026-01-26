import { Request, Response } from "express";

import { errorRequestHandler } from "../error.middleware.js";

describe("#Component errorRequestHandler", () => {
  const mockCallback: jest.Mock = jest.fn();
  const mockResponseStatus: jest.Mock = jest.fn();
  const mockResponseJson: jest.Mock = jest.fn();
  const ERROR_CODE = 500;

  const error = new Error("test error");
  const request = {
    path: "test path",
  } as Request;
  const response = {} as Response;
  (response.status as jest.Mock) = mockResponseStatus;
  (response.json as jest.Mock) = mockResponseJson;

  it("should call callback once", async () => {
    errorRequestHandler(error, request, response, mockCallback);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should call res.status and res.json with correct data", async () => {
    errorRequestHandler(error, request, response, mockCallback);

    expect(mockResponseStatus).toHaveBeenCalledWith(ERROR_CODE);
    expect(mockResponseJson).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      status: ERROR_CODE,
      error: error.message,
      path: request.path,
    });
  });
});
