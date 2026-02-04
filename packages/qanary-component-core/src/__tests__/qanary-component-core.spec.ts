import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Express } from "express";

import type { IQanaryComponentCoreOptions } from "../qanary-component-core.js";

let mockApp: Express;

const mockAboutRouterResponse = {};
const mockAboutRouter = mock(() => Promise.resolve(mockAboutRouterResponse));

const mockAnnotateQuestionRouterResponse = {};
const mockAnnotateQuestionRouter = mock(() => Promise.resolve(mockAnnotateQuestionRouterResponse));

const mockHealthRouterResponse = {};
const mockHealthRouter = mock(() => Promise.resolve(mockHealthRouterResponse));

const mockErrorRequestHandler = mock(() => Promise.resolve({}));

const SPRING_BOOT_ADMIN_URL = new URL("http://spring-boot-url.test:1234");
const SPRING_BOOT_CLIENT_URL = new URL("http://service-base-url.test:1234");

const mockQanaryComponentCoreServiceConfigCreate = mock(() =>
  Promise.resolve({
    springBootAdminUrl: SPRING_BOOT_ADMIN_URL,
    springBootAdminClientInstanceServiceBaseUrl: SPRING_BOOT_CLIENT_URL,
  })
);

const mockRegistrationService = mock(() => Promise.resolve({}));

mock.module("express", () => {
  const mockExpress = mock(() => {
    mockApp = {
      use: mock(),
      listen: mock((_port: number, callback: () => void) => {
        callback();
      }),
    } as unknown as Express;
    return mockApp;
  });
  mockExpress.json = mock();
  mockExpress.urlencoded = mock();

  return { default: mockExpress };
});

mock.module("cors", () => {
  return { default: mock() };
});

mock.module("../resources/about/about.router.js", () => ({
  aboutRouter: mockAboutRouter,
}));

mock.module("../resources/annotatequestion/annotatequestion.router.js", () => ({
  annotateQuestionRouter: mockAnnotateQuestionRouter,
}));

mock.module("../resources/health/health.router.js", () => ({
  healthRouter: mockHealthRouter,
}));

mock.module("../middlewares/error/error.middleware.js", () => ({
  errorRequestHandler: mockErrorRequestHandler,
}));

mock.module("../services/registration/registration.model.js", () => ({
  QanaryComponentCoreServiceConfig: {
    create: mockQanaryComponentCoreServiceConfigCreate,
  },
}));

mock.module("../services/registration/registration.service.js", () => ({
  registrationService: mockRegistrationService,
}));

import cors from "cors";
import express from "express";
import { QanaryComponentCore } from "../qanary-component-core.js";
import { QanaryComponentCoreServiceConfig } from "../services/registration/registration.model.js";

describe("#Component QanaryComponentCore", () => {
  const mockHandler = mock();
  const options = {
    handler: mockHandler,
  } as IQanaryComponentCoreOptions;

  beforeEach(() => {
    // Clear all mock call counts
    (express as any).mockClear();
    (express.json as any).mockClear();
    (express.urlencoded as any).mockClear();
    (cors as any).mockClear();
    mockAboutRouter.mockClear();
    mockAnnotateQuestionRouter.mockClear();
    mockHealthRouter.mockClear();
    mockErrorRequestHandler.mockClear();
    mockQanaryComponentCoreServiceConfigCreate.mockClear();
    mockRegistrationService.mockClear();
    // Only clear mockApp if it exists
    if (mockApp && mockApp.use) {
      (mockApp.use as any).mockClear();
    }
    if (mockApp && mockApp.listen) {
      (mockApp.listen as any).mockClear();
    }
  });

  test("should create and return express server", async () => {
    const app = await QanaryComponentCore(options);

    expect(express).toHaveBeenCalledTimes(1);
    expect(app).toStrictEqual(mockApp);
  });

  test("should add application/json parsing configuration", async () => {
    await QanaryComponentCore(options);

    expect(express.json).toHaveBeenCalledTimes(1);
    expect(express.urlencoded).toHaveBeenCalledWith({ extended: false });
    expect(cors).toHaveBeenCalledTimes(1);
  });

  test("should add about route", async () => {
    await QanaryComponentCore(options);

    expect(mockAboutRouter).toHaveBeenCalledTimes(1);
    expect(mockApp.use).toHaveBeenCalledWith("/", mockAboutRouterResponse);
  });

  test("should add annotatequestion route", async () => {
    await QanaryComponentCore(options);

    expect(mockAnnotateQuestionRouter).toHaveBeenCalledWith(mockHandler);
    expect(mockApp.use).toHaveBeenCalledWith("/annotatequestion", mockAnnotateQuestionRouterResponse);
  });

  test("should add health route", async () => {
    await QanaryComponentCore(options);

    expect(mockHealthRouter).toHaveBeenCalledTimes(1);
    expect(mockApp.use).toHaveBeenCalledWith("/health", mockHealthRouterResponse);
  });

  test("should add error request handler", async () => {
    await QanaryComponentCore(options);

    expect(mockApp.use).toHaveBeenCalledWith(mockErrorRequestHandler);
  });

  test("should create service config and start server", async () => {
    await QanaryComponentCore(options);

    expect(QanaryComponentCoreServiceConfig.create).toHaveBeenCalledTimes(1);
    expect(mockApp.listen).toHaveBeenCalledWith(SPRING_BOOT_CLIENT_URL.port, expect.any(Function));
  });

  test("should register server through service", async () => {
    await QanaryComponentCore(options);

    expect(mockRegistrationService).toHaveBeenCalledWith({
      springBootAdminUrl: SPRING_BOOT_ADMIN_URL,
      springBootAdminClientInstanceServiceBaseUrl: SPRING_BOOT_CLIENT_URL,
    });
  });
});
