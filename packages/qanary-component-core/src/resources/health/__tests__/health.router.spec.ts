import { Router } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { readHealth } from "../health.controller.js";
import { healthRouter } from "../health.router.js";

describe("#Component healthRouter", () => {
  it("should return a router with get on '/' route and a request handler", async () => {
    const routerObject = {} as Router;
    const mockGet: jest.Mock = jest.fn();
    (routerObject.get as jest.Mock) = mockGet;

    const mockRouter: jest.Mock = jest.fn().mockReturnValue(routerObject);
    (Router as jest.Mock) = mockRouter;

    const mockRequestHandler: jest.Mock = jest.fn();
    const mockReadHealth: jest.Mock = jest.fn(() => Promise.resolve(mockRequestHandler));
    (readHealth as jest.Mock) = mockReadHealth;

    const router = await healthRouter();

    expect(router).not.toBeNull();
    expect(mockRouter).toHaveBeenCalledTimes(1);
    expect(mockReadHealth).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(["/"], mockRequestHandler);
  });
});
