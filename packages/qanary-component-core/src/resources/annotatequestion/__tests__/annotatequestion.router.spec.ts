import { Router } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createAnnotateQuestion } from "../annotatequestion.controller.js";
import { annotateQuestionRouter } from "../annotatequestion.router.js";

describe("#Component annotateQuestionRouter", () => {
  it("should return a router with post on '/' route and a request handler", async () => {
    const routerObject = {} as Router;
    const mockPost: jest.Mock = jest.fn();
    (routerObject.post as jest.Mock) = mockPost;

    const mockRouter: jest.Mock = jest.fn().mockReturnValue(routerObject);
    (Router as jest.Mock) = mockRouter;

    const mockRequestHandler: jest.Mock = jest.fn();
    const mockCreateAnnotateQuestion: jest.Mock = jest.fn(() => Promise.resolve(mockRequestHandler));
    (createAnnotateQuestion as jest.Mock) = mockCreateAnnotateQuestion;

    const mockHandler: jest.Mock = jest.fn(() => Promise.resolve());

    const router = await annotateQuestionRouter(mockHandler);

    expect(router).not.toBeNull();
    expect(mockRouter).toHaveBeenCalledTimes(1);
    expect(mockCreateAnnotateQuestion).toHaveBeenCalledTimes(1);
    expect(mockCreateAnnotateQuestion).toHaveBeenCalledWith(mockHandler);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(["/"], mockRequestHandler);
  });
});
