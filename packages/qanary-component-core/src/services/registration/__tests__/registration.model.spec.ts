// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SpringBootAdminServerApi } from "@leipzigtreechat/qanary-api";

import { getPort } from "../../../helper/get-port.js";
import {
  QanaryComponentCoreServiceConfig,
  RegistrationInfo,
  SpringBootAdminClientInstanceServiceBaseUrl,
  SpringBootAdminUrl,
} from "../registration.model.js";

jest.mock("@leipzigtreechat/qanary-api", () => {
  return {
    SpringBootAdminServerApi: {
      Configuration: jest.fn().mockImplementation(() => {
        return {};
      }),
    },
  };
});

describe("#Component SpringBootAdminUrl", () => {
  const ORIGINAL_ENV = process.env;
  const DEFAULT_URL = new URL("http://localhost:40111");

  beforeEach(() => {
    jest.resetModules();
    process.env = ORIGINAL_ENV;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("should return default url if 'SPRING_BOOT_ADMIN_URL' not set", async () => {
    process.env = {};

    const url = await SpringBootAdminUrl.from();

    expect(url.toString()).toStrictEqual(DEFAULT_URL.toString());
  });

  it("should call SpringBootAdminServerApi.Configuration with toConfiguration", async () => {
    const url = await SpringBootAdminUrl.from();

    url.toConfiguration();

    expect(url).not.toBeNull();
    expect(SpringBootAdminServerApi.Configuration).toHaveBeenCalledTimes(1);
    expect(SpringBootAdminServerApi.Configuration).toHaveBeenCalledWith({
      basePath: DEFAULT_URL.origin,
      username: DEFAULT_URL.username,
      password: DEFAULT_URL.password,
    });
  });

  it("should return 'SPRING_BOOT_ADMIN_URL' as url if set", async () => {
    process.env.SPRING_BOOT_ADMIN_URL = "http://url.test:1234";
    const TEST_URL = new URL("http://url.test:1234");

    const url = await SpringBootAdminUrl.from();

    expect(url.toString()).toStrictEqual(TEST_URL.toString());
  });
});

describe("#Component SpringBootAdminClientInstanceServiceBaseUrl", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = ORIGINAL_ENV;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("should return default url if 'SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL' not set", async () => {
    const TEST_PORT = 40500;
    const TEST_URL = new URL(`http://localhost:${TEST_PORT}`);
    process.env = {};

    const mockGetPort: jest.Mock = jest.fn(() => Promise.resolve(TEST_PORT));
    (getPort as jest.Mock) = mockGetPort;

    const url = await SpringBootAdminClientInstanceServiceBaseUrl.from();

    expect(url.toString()).toStrictEqual(TEST_URL.toString());
    expect(getPort).toHaveBeenCalledTimes(1);
  });

  it("should return 'SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL' as url if set", async () => {
    process.env["SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL"] = "http://url.test:1234";
    const TEST_URL = new URL("http://url.test:1234");

    const url = await SpringBootAdminClientInstanceServiceBaseUrl.from();

    expect(url.toString()).toStrictEqual(TEST_URL.toString());
  });
});

describe("#Component QanaryComponentCoreServiceConfig", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = ORIGINAL_ENV;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("should create a new 'QanaryComponentCoreServiceConfig' fron env variables", async () => {
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
  beforeEach(() => {
    jest.resetModules();
  });

  it("should create a new 'RegistrationInfo' instance from provided config with package.json description", async () => {
    const pkg = {
      name: "test-component-name",
      description: "test-description",
    };
    jest.mock(`${process.cwd()}/package.json`, () => pkg);
    process.env.npm_package_name = "test-component-name";

    const SPRING_BOOT_ADMIN_URL = new URL("http://spring-boot-url.test:1234");
    const SPRING_BOOT_CLIENT_URL = new URL("http://service-base-url.test:1234");

    const config = {
      springBootAdminUrl: SPRING_BOOT_ADMIN_URL,
      springBootAdminClientInstanceServiceBaseUrl: SPRING_BOOT_CLIENT_URL,
    } as QanaryComponentCoreServiceConfig;

    const info = await RegistrationInfo.from(config);

    const expectedInfo = {
      name: pkg.name,
      serviceUrl: SPRING_BOOT_CLIENT_URL.origin,
      healthUrl: SPRING_BOOT_CLIENT_URL.origin + "/health",
      metadata: {
        start: expect.any(String),
        description: pkg.description,
        about: SPRING_BOOT_CLIENT_URL.origin + "/about",
        written_in: "TypeScript",
      },
    } as RegistrationInfo;

    expect(info).not.toBeNull();
    expect(info.name).toStrictEqual(expectedInfo.name);
    expect(info.serviceUrl).toStrictEqual(expectedInfo.serviceUrl);
    expect(info.healthUrl).toStrictEqual(expectedInfo.healthUrl);
    expect(info.metadata).toStrictEqual(expectedInfo.metadata);
  });

  it("should create a new 'RegistrationInfo' instance from provided config with default description", async () => {
    const pkg = {};
    jest.mock(`${process.cwd()}/package.json`, () => pkg);

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
      healthUrl: SPRING_BOOT_CLIENT_URL.origin + "/health",
      metadata: {
        start: expect.any(String),
        description: "",
        about: SPRING_BOOT_CLIENT_URL.origin + "/about",
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
