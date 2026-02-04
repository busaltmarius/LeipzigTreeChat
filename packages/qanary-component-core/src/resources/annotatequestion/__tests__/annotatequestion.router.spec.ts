import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { RequestHandler, Router } from "express";

const routerObject = {} as Router;
const mockPost = mock();
// @ts-expect-error - mocking
routerObject.post = mockPost;

const mockRouter = mock(() => routerObject);

const mockRequestHandler = {} as RequestHandler;

mock.module("express", () => ({
  Router: mockRouter,
}));

import { annotateQuestionRouter } from "../annotatequestion.router.js";

describe("#Component annotateQuestionRouter", () => {
  beforeEach(() => {
    mockRouter.mockClear();
    mockPost.mockClear();
  });

  test("should return a router with post on '/' route and a request handler", async () => {
    const router = await annotateQuestionRouter(mockRequestHandler);

    expect(router).not.toBeNull();
    expect(mockRouter).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith("/", mockRequestHandler);
  });
});
