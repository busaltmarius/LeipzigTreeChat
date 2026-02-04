import { afterAll, afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SpringBootAdminServerApi } from "@leipzigtreechat/qanary-api";

const mockConfiguration = mock(() => {
  return {};
});

let mockGetPort = mock(() => Promise.resolve(40500));

mock.module("@leipzigtreechat/qanary-api", () => {
  return {
    SpringBootAdminServerApi: {
      Configuration: mockConfiguration,
    },
  };
});

mock.module("../../../helper/get-port.js", () => ({
  getPort: mockGetPort,
}));

import { getPort } from "../../../helper/get-port.js";
import {
  QanaryComponentCoreServiceConfig,
  RegistrationInfo,
  SpringBootAdminClientInstanceServiceBaseUrl,
  SpringBootAdminUrl,
} from "../registration.model.js";

describe("#Component SpringBootAdminUrl", () => {
  const ORIGINAL_ENV = process.env;
  const DEFAULT_URL = new URL("http://localhost:40111");

  beforeEach(() => {
    process.env = ORIGINAL_ENV;
    mockConfiguration.mockClear();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test("should return default url if 'SPRING_BOOT_ADMIN_URL' not set", async () => {
    process.env = {};

    const url = await SpringBootAdminUrl.from();

    expect(url.toString()).toStrictEqual(DEFAULT_URL.toString());
  });

  test("should call SpringBootAdminServerApi.Configuration with toConfiguration", async () => {
    const url = await SpringBootAdminUrl.from();

    url.toConfiguration();

    expect(url).not.toBeNull();
    expect(mockConfiguration).toHaveBeenCalledTimes(1);
    expect(mockConfiguration).toHaveBeenCalledWith({
      basePath: DEFAULT_URL.origin,
      username: DEFAULT_URL.username,
      password: DEFAULT_URL.password,
    });
  });

  test("should return 'SPRING_BOOT_ADMIN_URL' as url if set", async () => {
    process.env.SPRING_BOOT_ADMIN_URL = "http://url.test:1234";
    const TEST_URL = new URL("http://url.test:1234");

    const url = await SpringBootAdminUrl.from();

    expect(url.toString()).toStrictEqual(TEST_URL.toString());
  });
});

describe("#Component SpringBootAdminClientInstanceServiceBaseUrl", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = ORIGINAL_ENV;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test("should return default url if 'SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL' not set", async () => {
    const TEST_PORT = 40500;
    const TEST_URL = new URL(`http://localhost:${TEST_PORT}`);
    process.env = {};

    mockGetPort = mock(() => Promise.resolve(TEST_PORT));

    const url = await SpringBootAdminClientInstanceServiceBaseUrl.from();

    expect(url.toString()).toStrictEqual(TEST_URL.toString());
    expect(mockGetPort).toHaveBeenCalledTimes(1);
  });

  test("should return 'SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL' as url if set", async () => {
    process.env["SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL"] = "http://url.test:1234";
    const TEST_URL = new URL("http://url.test:1234");

    const url = await SpringBootAdminClientInstanceServiceBaseUrl.from();

    expect(url.toString()).toStrictEqual(TEST_URL.toString());
  });
});

describe("#Component QanaryComponentCoreServiceConfig", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = ORIGINAL_ENV;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test("should create a new 'QanaryComponentCoreServiceConfig' fron env variables", async () => {
    process.env.SPRING_BOOT_ADMIN_URL = "http://spring-boot-url.test:1234";
    const SPRING_BOOT_ADMIN_URL = new URL("http://spring-boot-url.test:1234");
    process.env["SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL"] = "http://service-base-url.test:1234";
    const SPRING_BOOT_CLIENT_URL = new URL("http://service-base-url.test:1234");

    const config = await QanaryComponentCoreServiceConfig.create();

    expect(config).not.toBeNull();
    expect(config.springBootAdminUrl.toString()).toStrictEqual(SPRING_BOOT_ADMIN_URL.toString());
    expect(config.springBootAdminClientInstanceServiceBaseUrl.toString()).toStrictEqual(
      SPRING_BOOT_CLIENT_URL.toString()
    );
  });
});

describe("#Component RegistrationInfo", () => {
  const testPackagePath = join(process.cwd(), "package.json");
  let originalPackage: string | null = null;
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    // Backup original package.json if it exists
    if (existsSync(testPackagePath)) {
      originalPackage = readFileSync(testPackagePath, "utf-8");
    }
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    // Restore original package.json
    if (originalPackage !== null) {
      writeFileSync(testPackagePath, originalPackage);
    }
  });

  test("should create a new 'RegistrationInfo' instance from provided config with package.json description", async () => {
    const mockPkg = {
      name: "test-component-name",
      description: "test-description",
    };

    // Write test package.json
    writeFileSync(testPackagePath, JSON.stringify(mockPkg));

    // Clear module cache to force re-import
    delete require.cache[testPackagePath];

    process.env.npm_package_name = "test-component-name";

    const SPRING_BOOT_ADMIN_URL = new URL("http://spring-boot-url.test:1234");
    const SPRING_BOOT_CLIENT_URL = new URL("http://service-base-url.test:1234");

    const config = {
      springBootAdminUrl: SPRING_BOOT_ADMIN_URL,
      springBootAdminClientInstanceServiceBaseUrl: SPRING_BOOT_CLIENT_URL,
    } as QanaryComponentCoreServiceConfig;

    const info = await RegistrationInfo.from(config);

    const expectedInfo = {
      name: mockPkg.name,
      serviceUrl: SPRING_BOOT_CLIENT_URL.origin,
      healthUrl: `${SPRING_BOOT_CLIENT_URL.origin}/health`,
      metadata: {
        start: expect.any(String),
        description: mockPkg.description,
        about: `${SPRING_BOOT_CLIENT_URL.origin}/about`,
        written_in: "TypeScript",
      },
    } as RegistrationInfo;

    expect(info).not.toBeNull();
    expect(info.name).toStrictEqual(expectedInfo.name);
    expect(info.serviceUrl).toStrictEqual(expectedInfo.serviceUrl);
    expect(info.healthUrl).toStrictEqual(expectedInfo.healthUrl);
    expect(info.metadata).toStrictEqual(expectedInfo.metadata);
  });

  test("should create a new 'RegistrationInfo' instance from provided config with default description", async () => {
    const mockPkg = {};

    // Write test package.json
    writeFileSync(testPackagePath, JSON.stringify(mockPkg));

    // Clear module cache to force re-import
    delete require.cache[testPackagePath];

    const SPRING_BOOT_ADMIN_URL = new URL("http://spring-boot-url.test:1234");
    const SPRING_BOOT_CLIENT_URL = new URL("http://service-base-url.test:1234");

    const config = {
      springBootAdminUrl: SPRING_BOOT_ADMIN_URL,
      springBootAdminClientInstanceServiceBaseUrl: SPRING_BOOT_CLIENT_URL,
    } as QanaryComponentCoreServiceConfig;

    const info = await RegistrationInfo.from(config);

    const expectedInfo = {
      name: SPRING_BOOT_CLIENT_URL.hostname,
      serviceUrl: SPRING_BOOT_CLIENT_URL.origin,
      healthUrl: `${SPRING_BOOT_CLIENT_URL.origin}/health`,
      metadata: {
        start: expect.any(String),
        description: "",
        about: `${SPRING_BOOT_CLIENT_URL.origin}/about`,
        written_in: "TypeScript",
      },
    } as RegistrationInfo;

    expect(info).not.toBeNull();
    expect(info.name).toStrictEqual(expectedInfo.name);
    expect(info.serviceUrl).toStrictEqual(expectedInfo.serviceUrl);
    expect(info.healthUrl).toStrictEqual(expectedInfo.healthUrl);
    expect(info.metadata).toStrictEqual(expectedInfo.metadata);
  });
});
