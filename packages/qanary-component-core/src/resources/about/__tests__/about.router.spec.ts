import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Router } from "express";

const routerObject = {} as Router;
const mockGet = mock();
// @ts-expect-error - mocking
routerObject.get = mockGet;

const mockRouter = mock(() => routerObject);

const mockRequestHandler = mock();
const mockReadAbout = mock(() => Promise.resolve(mockRequestHandler));

mock.module("express", () => ({
  Router: mockRouter,
}));

mock.module("../about.controller.js", () => ({
  readAbout: mockReadAbout,
}));

import { aboutRouter } from "../about.router.js";

describe("#Component aboutRouter", () => {
  beforeEach(() => {
    mockRouter.mockClear();
    mockReadAbout.mockClear();
    mockGet.mockClear();
  });

  test("should return a router with get on '/' and '/about' routes and a request handler", async () => {
    const router = await aboutRouter();

    expect(router).not.toBeNull();
    expect(mockRouter).toHaveBeenCalledTimes(1);
    expect(mockReadAbout).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(["/", "/about"], mockRequestHandler);
  });
});
