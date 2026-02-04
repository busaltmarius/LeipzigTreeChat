import { describe, expect, mock, test } from "bun:test";
import type { QanaryComponentCoreServiceConfig } from "../registration.model.js";

const mockRegistrationInfoFrom = mock(() => Promise.resolve({}));
const mockCallAdminServer = mock();
const mockSleep = mock();

mock.module("../registration.model.js", () => {
  return {
    RegistrationInfo: {
      from: mockRegistrationInfoFrom,
    },
  };
});

mock.module("../../../helper/sleep.js", () => ({
  sleep: mockSleep,
}));

mock.module("../registration.service.js", () => ({
  callAdminServer: mockCallAdminServer,
  registrationService: async (serviceConfig: QanaryComponentCoreServiceConfig, interval = 10000) => {
    await mockRegistrationInfoFrom();
    const info = {};
    await mockCallAdminServer(serviceConfig, info);
    await mockSleep(interval);
  },
}));

import { sleep } from "../../../helper/sleep.js";
import { RegistrationInfo } from "../registration.model.js";
import { callAdminServer, registrationService } from "../registration.service.js";

describe("#Component registrationService", () => {
  const serviceConfig = {
    springBootAdminUrl: new URL("http://spring-boot-url.test:1234"),
    springBootAdminClientInstanceServiceBaseUrl: new URL("http://service-base-url.test:1234"),
  } as QanaryComponentCoreServiceConfig;

  test("should return request handler that calls res.status and res.json", async () => {
    const INTERVAL = 1000;

    await registrationService(serviceConfig, INTERVAL);

    expect(RegistrationInfo.from).toHaveBeenCalledWith(serviceConfig);
    expect(callAdminServer).toHaveBeenCalledWith(serviceConfig, {});
    expect(sleep).toHaveBeenCalledWith(INTERVAL);
  });

  test("should use default interval", async () => {
    const DEFAULT_INTERVAL = 10000;

    await registrationService(serviceConfig);

    expect(RegistrationInfo.from).toHaveBeenCalledWith(serviceConfig);
    expect(callAdminServer).toHaveBeenCalledWith(serviceConfig, {});
    expect(sleep).toHaveBeenCalledWith(DEFAULT_INTERVAL);
  });
});
