import { sleep } from "../../../helper/sleep.js";
import { QanaryComponentCoreServiceConfig, RegistrationInfo } from "../registration.model.js";
import { callAdminServer, registrationService } from "../registration.service.js";

jest.mock("../registration.model", () => {
  return {
    RegistrationInfo: {
      from: jest.fn(() => Promise.resolve({})),
    },
  };
});

describe("#Component registrationService", () => {
  const serviceConfig = {
    springBootAdminUrl: new URL("http://spring-boot-url.test:1234"),
    springBootAdminClientInstanceServiceBaseUrl: new URL("http://service-base-url.test:1234"),
  } as QanaryComponentCoreServiceConfig;

  const mockCallAdminServer: jest.Mock = jest.fn();
  (callAdminServer as jest.Mock) = mockCallAdminServer;
  const mockSleep: jest.Mock = jest.fn();
  (sleep as jest.Mock) = mockSleep;

  it("should return request handler that calls res.status and res.json", async () => {
    const INTERVAL = 1000;

    await registrationService(serviceConfig, INTERVAL);

    expect(RegistrationInfo.from).toHaveBeenCalledWith(serviceConfig);
    expect(callAdminServer).toHaveBeenCalledWith(serviceConfig, {});
    expect(sleep).toHaveBeenCalledWith(INTERVAL);
  });

  it("should use default interval", async () => {
    const DEFAULT_INTERVAL = 10000;

    await registrationService(serviceConfig);

    expect(RegistrationInfo.from).toHaveBeenCalledWith(serviceConfig);
    expect(callAdminServer).toHaveBeenCalledWith(serviceConfig, {});
    expect(sleep).toHaveBeenCalledWith(DEFAULT_INTERVAL);
  });
});
