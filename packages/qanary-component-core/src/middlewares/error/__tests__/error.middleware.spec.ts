import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Request, Response } from "express";

import { errorRequestHandler } from "../error.middleware.js";

describe("#Component errorRequestHandler", () => {
  const mockCallback = mock();
  const mockResponseStatus = mock();
  const mockResponseJson = mock();
  const ERROR_CODE = 500;

  const error = new Error("test error");
  const request = {
    path: "test path",
  } as Request;
  const response = {} as Response;
  // @ts-expect-error - mocking
  response.status = mockResponseStatus.mockReturnValue(response);
  // @ts-expect-error - mocking
  response.json = mockResponseJson;

  beforeEach(() => {
    mockCallback.mockClear();
    mockResponseStatus.mockClear();
    mockResponseJson.mockClear();
  });

  test("should call callback once", async () => {
    errorRequestHandler(error, request, response, mockCallback);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test("should call res.status and res.json with correct data", async () => {
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
