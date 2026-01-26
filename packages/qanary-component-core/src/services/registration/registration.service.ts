import { SpringBootAdminServerApi } from "@leipzigtreechat/qanary-api";

import { sleep } from "../../helper/sleep.js";
import { type QanaryComponentCoreServiceConfig, RegistrationInfo } from "./registration.model.js";

/**
 * The internal in which the service registers with the pipeline again in Milliseconds
 */
const RENEW_REGISTRATION_INTERVAL = 10000; // 10 seconds

/**
 * The possible connections between the Spring Boot Admin and this instance
 */
enum SUBSCRIPTION_STATUS {
  /** the initial subscription status */
  UNKNOWN,
  /** the status if subscribing was successful */
  SUBSCRIBED,
  /** the status if subscribing was not successfull */
  DETACHED,
}

/**
 * The status of the connection between the Spring Boot Admin and this component
 */
let subscriptionStatus: SUBSCRIPTION_STATUS = SUBSCRIPTION_STATUS.UNKNOWN;

/**
 * Calls the Spring Boot Admin Server to register the component by sending a POST request
 * @param config the configuration of the component
 * @param registration the registration information of the component
 */
export const callAdminServer = async (config: QanaryComponentCoreServiceConfig, registration: RegistrationInfo) => {
  // the generated code from the OpenAPI specification
  SpringBootAdminServerApi.SpringBootAdminServerApiFactory(config.springBootAdminUrl.toConfiguration())
    .createInstances(registration)
    .then((response) => {
      if (subscriptionStatus !== SUBSCRIPTION_STATUS.SUBSCRIBED) {
        console.group(`Component ${registration.name} was registered`);
        console.log(`Endpoint:`, response.headers.location);
        console.log(`Data:`, JSON.parse(response.config.data));
        console.groupEnd();
      }

      subscriptionStatus = SUBSCRIPTION_STATUS.SUBSCRIBED;
    })
    .catch((err) => {
      if (subscriptionStatus !== SUBSCRIPTION_STATUS.DETACHED) {
        console.group(`Component ${registration.name} could not be registered`);
        console.warn(`Error:`, err.message);
        console.warn(`Error:`, JSON.parse(err.config.data));
        console.groupEnd();
      }
      subscriptionStatus = SUBSCRIPTION_STATUS.DETACHED;
    });
};

/**
 * Registers the component/service at the Spring Boot Admin Server and makes it available for the Qanary Pipeline
 * @param config the configuration of the component
 * @param interval the interval in which the component should call the Spring Boot Admin Server
 */
export const registrationService = async (
  config: QanaryComponentCoreServiceConfig,
  interval = RENEW_REGISTRATION_INTERVAL
) => {
  const registration: RegistrationInfo = await RegistrationInfo.from(config);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await callAdminServer(config, registration);
    await sleep(interval);

    if (process.env.NODE_ENV === "test") {
      break;
    }
  }
};
