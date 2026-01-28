import type { Request, Response } from "express";

import { readAbout } from "../about.controller.js";

describe("#Component readAbout", () => {
  const STATUS_OK = 200;

  it("should return request handler function", async () => {
    const requestHandler = await readAbout();

    expect(requestHandler).not.toBeNull();
  });

  it("should return request handler that calls res.status and res.json", async () => {
    const pkg = {
      name: "test-name",
      description: "test-description",
      version: "test-version",
    };
    jest.mock(`${process.cwd()}/package.json`, () => pkg);

    const request = {} as Request;

    const response = {} as Response;
    const mockResponseStatus: jest.Mock = jest.fn().mockReturnValue(response);
    const mockResponseJson: jest.Mock = jest.fn();
    (response.status as jest.Mock) = mockResponseStatus;
    (response.json as jest.Mock) = mockResponseJson;

    const mockNext: jest.Mock = jest.fn();

    const requestHandler = await readAbout();
    await requestHandler(request, response, mockNext);

    expect(mockResponseStatus).toHaveBeenCalledWith(STATUS_OK);
    expect(mockResponseJson).toHaveBeenCalledWith(pkg);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
