import { Router } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { readAbout } from "../about.controller.js";
import { aboutRouter } from "../about.router.js";

describe("#Component aboutRouter", () => {
  it("should return a router with get on '/' and '/about' routes and a request handler", async () => {
    const routerObject = {} as Router;
    const mockGet: jest.Mock = jest.fn();
    (routerObject.get as jest.Mock) = mockGet;

    const mockRouter: jest.Mock = jest.fn().mockReturnValue(routerObject);
    (Router as jest.Mock) = mockRouter;

    const mockRequestHandler: jest.Mock = jest.fn();
    const mockReadAbout: jest.Mock = jest.fn(() => Promise.resolve(mockRequestHandler));
    (readAbout as jest.Mock) = mockReadAbout;

    const router = await aboutRouter();

    expect(router).not.toBeNull();
    expect(mockRouter).toHaveBeenCalledTimes(1);
    expect(mockReadAbout).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(["/", "/about"], mockRequestHandler);
  });
});
