import { describe, expect, mock, test } from "bun:test";
import type { Request, Response } from "express";

import { createAnnotateQuestion } from "../annotatequestion.controller.js";

describe("#Component createAnnotateQuestion", () => {
  const mockHandler = mock(() => Promise.resolve());

  test("should return request handler function", async () => {
    const requestHandler = await createAnnotateQuestion(mockHandler);

    expect(requestHandler).not.toBeNull();
  });

  test("should return request handler that calls handler and res.json", async () => {
    const request = {
      body: {
        endpoint: "test-endpoint",
        inGraph: "test-in-graph",
        outGraph: "test-out-graph",
      },
    } as Request;

    const response = {} as Response;
    const mockResponseJson = mock();
    // @ts-expect-error - mocking
    response.json = mockResponseJson;

    const mockNext = mock();

    const requestHandler = await createAnnotateQuestion(mockHandler);
    await requestHandler(request, response, mockNext);

    expect(mockHandler).toHaveBeenCalledWith(request.body);
    expect(mockResponseJson).toHaveBeenCalledWith(request.body);
  });

  test("should return request handler that calls next on invalid message in req.body", async () => {
    const request = {
      body: {},
    } as Request;
    const response = {} as Response;

    const mockNext = mock();

    const requestHandler = await createAnnotateQuestion(mockHandler);
    await requestHandler(request, response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new Error("Message is invalid"));
  });
});
