import type { Request, Response } from "express";

import { readHealth } from "../health.controller.js";

describe("#Component readHealth", () => {
  const STATUS_OK = 200;

  it("should return request handler function", async () => {
    const requestHandler = await readHealth();

    expect(requestHandler).not.toBeNull();
  });

  it("should return request handler that calls res.status and res.json", async () => {
    const request = {} as Request;

    const response = {} as Response;
    const mockResponseStatus: jest.Mock = jest.fn().mockReturnValue(response);
    const mockResponseJson: jest.Mock = jest.fn();
    (response.status as jest.Mock) = mockResponseStatus;
    (response.json as jest.Mock) = mockResponseJson;

    const mockNext: jest.Mock = jest.fn();

    const requestHandler = await readHealth();
    await requestHandler(request, response, mockNext);

    expect(mockResponseStatus).toHaveBeenCalledWith(STATUS_OK);
    expect(mockResponseJson).toHaveBeenCalledWith({
      status: "UP",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
