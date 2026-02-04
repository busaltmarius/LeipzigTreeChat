import { describe, expect, mock, test } from "bun:test";
import type { Request, Response } from "express";

import { readHealth } from "../health.controller.js";

describe("#Component readHealth", () => {
  const STATUS_OK = 200;

  test("should return request handler function", async () => {
    const requestHandler = await readHealth();

    expect(requestHandler).not.toBeNull();
  });

  test("should return request handler that calls res.status and res.json", async () => {
    const request = {} as Request;

    const response = {} as Response;
    const mockResponseStatus = mock().mockReturnValue(response);
    const mockResponseJson = mock();
    // @ts-expect-error - mocking
    response.status = mockResponseStatus;
    // @ts-expect-error - mocking
    response.json = mockResponseJson;

    const mockNext = mock();

    const requestHandler = await readHealth();
    await requestHandler(request, response, mockNext);

    expect(mockResponseStatus).toHaveBeenCalledWith(STATUS_OK);
    expect(mockResponseJson).toHaveBeenCalledWith({
      status: "UP",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
