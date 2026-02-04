import { describe, expect, mock, test } from "bun:test";
import type { QanaryComponentApi } from "@leipzigtreechat/qanary-api";
import type { Request, Response } from "express";

import { createAnnotateQuestion } from "../annotatequestion.controller.js";

describe("#Component createAnnotateQuestion", () => {
  test("should return request handler function", async () => {
    const mockHandler = mock(() => Promise.resolve({} as QanaryComponentApi.IQanaryMessage));

    const requestHandler = await createAnnotateQuestion(mockHandler);

    expect(requestHandler).not.toBeNull();
  });

  test("should return request handler that calls handler function and res.json", async () => {
    const mockHandler = mock(() => Promise.resolve({} as QanaryComponentApi.IQanaryMessage));
    const mockHandlerResponse = {
      test: "test",
    } as unknown as QanaryComponentApi.IQanaryMessage;
    mockHandler.mockImplementation(() => Promise.resolve(mockHandlerResponse));

    const mockBody = {
      test: "test",
    } as QanaryComponentApi.IQanaryMessage;
    const request = {
      body: mockBody,
    } as Request;

    const response = {} as Response;
    const mockResponseJson = mock();
    response.json = mockResponseJson as any;

    const requestHandler = await createAnnotateQuestion(mockHandler);
    await requestHandler(request, response, mock());

    expect(mockHandler).toHaveBeenCalledWith(mockBody);
    expect(mockResponseJson).toHaveBeenCalledWith(mockHandlerResponse);
  });

  test("should return request handler that calls next on error", async () => {
    const mockHandler = mock(() => Promise.resolve({} as QanaryComponentApi.IQanaryMessage));
    const error = new Error("test error");
    mockHandler.mockImplementation(() => Promise.reject(error));

    const request = {
      body: {},
    } as Request;

    const response = {} as Response;
    const mockNext = mock();

    const requestHandler = await createAnnotateQuestion(mockHandler);
    await requestHandler(request, response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
