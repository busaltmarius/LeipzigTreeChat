import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Router } from "express";

const routerObject = {} as Router;
const mockGet = mock();
// @ts-expect-error - mocking
routerObject.get = mockGet;

const mockRouter = mock(() => routerObject);

const mockRequestHandler = mock();
const mockReadHealth = mock(() => Promise.resolve(mockRequestHandler));

mock.module("express", () => ({
  Router: mockRouter,
}));

mock.module("../health.controller.js", () => ({
  readHealth: mockReadHealth,
}));

import { healthRouter } from "../health.router.js";

describe("#Component healthRouter", () => {
  beforeEach(() => {
    mockRouter.mockClear();
    mockReadHealth.mockClear();
    mockGet.mockClear();
  });

  test("should return a router with get on '/' route and a request handler", async () => {
    const router = await healthRouter();

    expect(router).not.toBeNull();
    expect(mockRouter).toHaveBeenCalledTimes(1);
    expect(mockReadHealth).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith("/", mockRequestHandler);
  });
});
