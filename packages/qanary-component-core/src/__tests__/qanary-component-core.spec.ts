import cors from "cors";
import express, { type Express } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { errorRequestHandler } from "../middlewares/error/error.middleware.js";
import { type IQanaryComponentCoreOptions, QanaryComponentCore } from "../qanary-component-core.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { aboutRouter } from "../resources/about/about.router.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { annotateQuestionRouter } from "../resources/annotatequestion/annotatequestion.router.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { healthRouter } from "../resources/health/health.router.js";
import { QanaryComponentCoreServiceConfig } from "../services/registration/registration.model.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { registrationService } from "../services/registration/registration.service.js";

let mockApp: Express;

jest.mock("express", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockExpress: any = jest.fn(() => {
    mockApp = {
      use: jest.fn(),
      listen: jest.fn().mockImplementation((_port: number, callback: () => void) => {
        callback();
      }),
    } as unknown as Express;
    return mockApp;
  });
  mockExpress.json = jest.fn();
  mockExpress.urlencoded = jest.fn();

  return mockExpress;
});

jest.mock("cors", () => {
  return jest.fn();
});

describe("#Component QanaryComponentCore", () => {
  const mockAboutRouterResponse = {};
  const mockAboutRouter: jest.Mock = jest.fn(() => Promise.resolve(mockAboutRouterResponse));
  (aboutRouter as jest.Mock) = mockAboutRouter;

  const mockAnnotateQuestionRouterResponse = {};
  const mockAnnotateQuestionRouter: jest.Mock = jest.fn(() => Promise.resolve(mockAnnotateQuestionRouterResponse));
  (annotateQuestionRouter as jest.Mock) = mockAnnotateQuestionRouter;

  const mockHealthRouterResponse = {};
  const mockHealthRouter: jest.Mock = jest.fn(() => Promise.resolve(mockHealthRouterResponse));
  (healthRouter as jest.Mock) = mockHealthRouter;

  const mockErrorRequestHandler: jest.Mock = jest.fn(() => Promise.resolve({}));
  (errorRequestHandler as jest.Mock) = mockErrorRequestHandler;

  const mockHandler = jest.fn();
  const options = {
    handler: mockHandler,
  } as IQanaryComponentCoreOptions;

  const SPRING_BOOT_ADMIN_URL = new URL("http://spring-boot-url.test:1234");
  const SPRING_BOOT_CLIENT_URL = new URL("http://service-base-url.test:1234");

  const mockQanaryComponentCoreServiceConfigCreate = jest.fn(() =>
    Promise.resolve({
      springBootAdminUrl: SPRING_BOOT_ADMIN_URL,
      springBootAdminClientInstanceServiceBaseUrl: SPRING_BOOT_CLIENT_URL,
    })
  );
  (QanaryComponentCoreServiceConfig.create as jest.Mock) = mockQanaryComponentCoreServiceConfigCreate;

  const mockRegistrationService: jest.Mock = jest.fn(() => Promise.resolve({}));
  (registrationService as jest.Mock) = mockRegistrationService;

  it("should create and return express server", async () => {
    const app = await QanaryComponentCore(options);

    expect(express).toHaveBeenCalledTimes(1);
    expect(app).toStrictEqual(mockApp);
  });

  it("should add application/json parsing configuration", async () => {
    await QanaryComponentCore(options);

    expect(express.json).toHaveBeenCalledTimes(1);
    expect(express.urlencoded).toHaveBeenCalledWith({ extended: false });
    expect(cors).toHaveBeenCalledTimes(1);
  });

  it("should add about route", async () => {
    await QanaryComponentCore(options);

    expect(mockAboutRouter).toHaveBeenCalledTimes(1);
    expect(mockApp.use).toHaveBeenCalledWith("/", mockAboutRouterResponse);
  });

  it("should add annotatequestion route", async () => {
    await QanaryComponentCore(options);

    expect(mockAnnotateQuestionRouter).toHaveBeenCalledWith(mockHandler);
    expect(mockApp.use).toHaveBeenCalledWith("/annotatequestion", mockAnnotateQuestionRouterResponse);
  });

  it("should add health route", async () => {
    await QanaryComponentCore(options);

    expect(mockHealthRouter).toHaveBeenCalledTimes(1);
    expect(mockApp.use).toHaveBeenCalledWith("/health", mockHealthRouterResponse);
  });

  it("should add error request handler", async () => {
    await QanaryComponentCore(options);

    expect(mockApp.use).toHaveBeenCalledWith(mockErrorRequestHandler);
  });

  it("should create service config and start server", async () => {
    await QanaryComponentCore(options);

    expect(QanaryComponentCoreServiceConfig.create).toHaveBeenCalledTimes(1);
    expect(mockApp.listen).toHaveBeenCalledWith(SPRING_BOOT_CLIENT_URL.port, expect.any(Function));
  });

  it("should register server through service", async () => {
    await QanaryComponentCore(options);

    expect(mockRegistrationService).toHaveBeenCalledWith({
      springBootAdminUrl: SPRING_BOOT_ADMIN_URL,
      springBootAdminClientInstanceServiceBaseUrl: SPRING_BOOT_CLIENT_URL,
    });
  });
});
