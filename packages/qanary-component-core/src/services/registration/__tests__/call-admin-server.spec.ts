import { SpringBootAdminServerApi } from "@leipzigtreechat/qanary-api";

import type { QanaryComponentCoreServiceConfig, RegistrationInfo } from "../registration.model.js";
import { callAdminServer } from "../registration.service.js";

// Mock package.json data
const pkg = {
  name: "@leipzigtreechat/qanary-component-core",
  version: "1.0.0",
  description: "Base typescript qanary component",
};

let mockCreateInstances = jest.fn(() => Promise.resolve({}));

jest.mock("@leipzigtreechat/qanary-api", () => {
  return {
    SpringBootAdminServerApi: {
      SpringBootAdminServerApiFactory: jest.fn().mockImplementation(() => {
        return {
          createInstances: mockCreateInstances,
        };
      }),
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

  const mockToConfiguration: jest.Mock = jest.fn().mockImplementation(() => {
    return {};
  });
  (serviceConfig.springBootAdminUrl.toConfiguration as jest.Mock) = mockToConfiguration;

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

  let mockConsoleGroup: jest.SpyInstance;

  afterAll(() => {
    mockConsoleGroup.mockRestore();
  });

  afterEach(() => {
    mockConsoleGroup.mockClear();
  });

  beforeEach(() => {
    jest.resetModules();
    mockConsoleGroup = jest.spyOn(console, "group");
  });

  it("should call server and not fail on valid response", async () => {
    mockCreateInstances = jest.fn(() =>
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

  it("should call server and not fail on error response", async () => {
    mockCreateInstances = jest.fn(() =>
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
