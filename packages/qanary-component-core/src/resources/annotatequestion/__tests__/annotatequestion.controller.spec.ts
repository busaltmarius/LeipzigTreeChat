import { Request, Response } from "express";

import { createAnnotateQuestion } from "../annotatequestion.controller.js";

describe("#Component createAnnotateQuestion", () => {
  const mockHandler: jest.Mock = jest.fn(() => Promise.resolve());

  it("should return request handler function", async () => {
    const requestHandler = await createAnnotateQuestion(mockHandler);

    expect(requestHandler).not.toBeNull();
  });

  it("should return request handler that calls handler and res.json", async () => {
    const request = {
      body: {
        endpoint: "test-endpoint",
        inGraph: "test-in-graph",
        outGraph: "test-out-graph",
      },
    } as Request;

    const response = {} as Response;
    const mockResponseJson: jest.Mock = jest.fn();
    (response.json as jest.Mock) = mockResponseJson;

    const mockNext: jest.Mock = jest.fn();

    const requestHandler = await createAnnotateQuestion(mockHandler);
    await requestHandler(request, response, mockNext);

    expect(mockHandler).toHaveBeenCalledWith(request.body);
    expect(mockResponseJson).toHaveBeenCalledWith(request.body);
  });

  it("should return request handler that calls next on invalid message in req.body", async () => {
    const request = {
      body: {},
    } as Request;
    const response = {} as Response;

    const mockNext: jest.Mock = jest.fn();

    const requestHandler = await createAnnotateQuestion(mockHandler);
    await requestHandler(request, response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new Error("Message is invalid"));
  });
});
