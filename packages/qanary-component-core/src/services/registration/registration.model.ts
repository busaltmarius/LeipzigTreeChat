import path from "node:path";

import { SpringBootAdminServerApi } from "@leipzigtreechat/qanary-api";

import { getPort } from "../../helper/get-port.js";

/**
 * An object to process the SpringBootAdminUrl
 */
export class SpringBootAdminUrl extends URL {
  /**
   * Converts this object to an axios fetch configuration, required by the API
   * @see https://openapi-generator.tech/docs/generators/typescript-axios
   */
  toConfiguration() {
    return new SpringBootAdminServerApi.Configuration({
      basePath: this.origin,
      username: this.username,
      password: this.password,
    });
  }

  /**
   * Determines the available SpringBootAdminUrl, or return a static URL
   * @private
   */
  private static getDefault(): string {
    const defaultUrl = "http://localhost:40111";

    if (process.env.SPRING_BOOT_ADMIN_URL) {
      return process.env.SPRING_BOOT_ADMIN_URL;
    }

    return defaultUrl;
  }

  /**
   * The factory method of the object
   */
  static async from(): Promise<SpringBootAdminUrl> {
    return new SpringBootAdminUrl(SpringBootAdminUrl.getDefault());
  }
}

/**
 * An object to process the SpringBootAdminClientInstanceServiceBaseUrl
 */
export class SpringBootAdminClientInstanceServiceBaseUrl extends URL {
  /**
   * Determines the available SpringBootAdminClientInstanceServiceBaseUrl, or return a static URL (dynamic port)
   * @private
   */
  private static async getDefault(): Promise<string> {
    if (process.env["SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL"]) {
      return process.env["SPRING_BOOT_ADMIN_CLIENT_INSTANCE_SERVICE-BASE-URL"];
    }

    if (process.env["QANARY_HOST"] && process.env["QANARY_PORT"]) {
      return `http://${process.env["QANARY_HOST"]}:${process.env["QANARY_PORT"]}`;
    }
    return `http://localhost:${await getPort()}`;
  }

  /**
   * The factory method of the object
   */
  static async from(): Promise<SpringBootAdminClientInstanceServiceBaseUrl> {
    return new SpringBootAdminClientInstanceServiceBaseUrl(
      await SpringBootAdminClientInstanceServiceBaseUrl.getDefault()
    );
  }
}

/**
 * An object to register with the Spring Boot Admin as an available instance.
 */
export class RegistrationInfo implements SpringBootAdminServerApi.IComponentRegistrationInfo {
  /**
   * The name of the instance
   */
  public name: string;
  /**
   * The URL, this service runs on
   */
  public serviceUrl: string;
  /**
   * The URL for checking the health of the instance
   */
  public healthUrl: string;
  /**
   * Additional meta data
   */
  public metadata: Record<string, string>;

  /**
   * The function to instantiate the object
   * @param options The options that can be passed to the object
   * @private
   */
  private constructor(options: RegistrationInfo) {
    this.name = options.name;
    this.serviceUrl = options.serviceUrl;
    this.healthUrl = options.healthUrl;
    this.metadata = options.metadata;
  }

  /**
   * Generates the registration object of the component for the Spring Boot Admin based on provided configuration
   * @returns an registration object for the Spring Boot Admin
   * @param config the configuration of the component
   */
  static async from(config: QanaryComponentCoreServiceConfig): Promise<RegistrationInfo> {
    const componentPackageJsonPath =
      process.env.npm_package_json ??
      (process.env.QANARY_COMPONENT_PACKAGE_JSON
        ? path.resolve(process.env.QANARY_COMPONENT_PACKAGE_JSON)
        : path.resolve(process.cwd(), "package.json"));
    const pkg = await import(componentPackageJsonPath);
    const componentName =
      (pkg as { name?: string }).name ?? config.springBootAdminClientInstanceServiceBaseUrl.hostname;

    return new RegistrationInfo({
      name: componentName,
      serviceUrl: config.springBootAdminClientInstanceServiceBaseUrl.origin,
      healthUrl: `${config.springBootAdminClientInstanceServiceBaseUrl.origin}/health`,
      metadata: {
        start: new Date().toISOString(),
        description: pkg.description ?? "",
        about: `${config.springBootAdminClientInstanceServiceBaseUrl.origin}/about`,
        written_in: "TypeScript",
      },
    });
  }
}

/**
 * An object containing the core configuration as URLs
 */
export class QanaryComponentCoreServiceConfig {
  /**
   * The URL of this service
   */
  public springBootAdminClientInstanceServiceBaseUrl: SpringBootAdminClientInstanceServiceBaseUrl;
  /**
   * The URL at which is registered
   */
  public springBootAdminUrl: SpringBootAdminUrl;

  /**
   * The function to instantiate the object
   * @param options The options that can be passed to the object
   * @private
   */
  private constructor(options: QanaryComponentCoreServiceConfig) {
    this.springBootAdminClientInstanceServiceBaseUrl = options.springBootAdminClientInstanceServiceBaseUrl;
    this.springBootAdminUrl = options.springBootAdminUrl;
  }

  /**
   * The factory method to create an `QanaryComponentCoreServiceConfig` object
   */
  static async create() {
    return new QanaryComponentCoreServiceConfig({
      springBootAdminUrl: await SpringBootAdminUrl.from(),
      springBootAdminClientInstanceServiceBaseUrl: await SpringBootAdminClientInstanceServiceBaseUrl.from(),
    });
  }
}
