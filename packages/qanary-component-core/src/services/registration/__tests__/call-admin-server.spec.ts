import { afterAll, afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { SpringBootAdminServerApi } from "@leipzigtreechat/qanary-api";

import type { QanaryComponentCoreServiceConfig, RegistrationInfo } from "../registration.model.js";
import { callAdminServer } from "../registration.service.js";

// Mock package.json data
const pkg = {
  name: "@leipzigtreechat/qanary-component-core",
  version: "1.0.0",
  description: "Base typescript qanary component",
};

const mockCreateInstances = mock(() => Promise.resolve({}));
const mockSpringBootAdminServerApiFactory = mock(() => {
  return {
    createInstances: mockCreateInstances,
  };
});

mock.module("@leipzigtreechat/qanary-api", () => {
  return {
    SpringBootAdminServerApi: {
      SpringBootAdminServerApiFactory: mockSpringBootAdminServerApiFactory,
    },
  };
});

describe("#Component callAdminServer", () => {
  const SPRING_BOOT_ADMIN_URL = new URL("http://spring-boot-url.test:1234");
  const SPRING_BOOT_CLIENT_URL = new URL("http://service-base-url.test:1234");

  const serviceConfig = {
    springBootAdminUrl: SPRING_BOOT_ADMIN_URL,
    springBootAdminClientInstanceServiceBaseUrl: SPRING_BOOT_CLIENT_URL,
  } as QanaryComponentCoreServiceConfig;

  const mockToConfiguration = mock(() => {
    return {};
  });
  // @ts-expect-error - mocking
  serviceConfig.springBootAdminUrl.toConfiguration = mockToConfiguration;

  console.debug(`name: ${pkg.name}`);
  console.debug(`serviceUrl: ${SPRING_BOOT_CLIENT_URL.origin}`);
  console.debug(`healthUrl: ${SPRING_BOOT_CLIENT_URL.origin}/health`);
  console.debug(`about: ${SPRING_BOOT_CLIENT_URL.origin}/about`);
  const registration = {
    name: pkg.name,
    serviceUrl: SPRING_BOOT_CLIENT_URL.origin,
    healthUrl: `${SPRING_BOOT_CLIENT_URL.origin}/health`,
    metadata: {
      start: expect.any(String),
      description: "test-description",
      about: `${SPRING_BOOT_CLIENT_URL.origin}/about`,
      written_in: "TypeScript",
    },
  } as RegistrationInfo;

  let mockConsoleGroup: ReturnType<typeof spyOn>;

  afterAll(() => {
    mockConsoleGroup.mockRestore();
  });

  afterEach(() => {
    mockConsoleGroup.mockClear();
    mockCreateInstances.mockClear();
    mockSpringBootAdminServerApiFactory.mockClear();
  });

  beforeEach(() => {
    mockConsoleGroup = spyOn(console, "group");
  });

  test("should call server and not fail on valid response", async () => {
    mockCreateInstances.mockImplementation(() =>
      Promise.resolve({
        headers: {
          location: "test-headers-location",
        },
        config: {
          data: "{}",
        },
      })
    );

    await callAdminServer(serviceConfig, registration);

    expect(SpringBootAdminServerApi.SpringBootAdminServerApiFactory).toHaveBeenCalledWith({});
    expect(mockCreateInstances).toHaveBeenCalledWith(registration);
    expect(mockConsoleGroup).toHaveBeenCalledWith(`Component ${registration.name} was registered`);
  });

  test("should call server and not fail on error response", async () => {
    mockCreateInstances.mockImplementation(() =>
      Promise.reject({
        message: "test-error",
        config: {
          data: "{}",
        },
      })
    );

    expect(async () => {
      await callAdminServer(serviceConfig, registration);
    }).not.toThrow(TypeError);
  });
});
