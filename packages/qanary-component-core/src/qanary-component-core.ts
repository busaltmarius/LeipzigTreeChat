import cors from "cors";
import express, { Express } from "express";

import { errorRequestHandler } from "./middlewares/error/error.middleware.js";
import { aboutRouter } from "./resources/about/about.router.js";
import { IQanaryComponentMessageHandler } from "./resources/annotatequestion/annotatequestion.model.js";
import { annotateQuestionRouter } from "./resources/annotatequestion/annotatequestion.router.js";
import { healthRouter } from "./resources/health/health.router.js";
import { QanaryComponentCoreServiceConfig } from "./services/registration/registration.model.js";
import { registrationService } from "./services/registration/registration.service.js";

/** the options of the qanary component core with optional service config */
export interface IQanaryComponentCoreOptions {
  /** the request handler of the qanary component/service */
  handler: IQanaryComponentMessageHandler;
}

/**
 * The core implementation (blueprint) of a Qanary component
 * @param options the options of the component
 * @returns the express app instance
 */
export async function QanaryComponentCore(options: IQanaryComponentCoreOptions): Promise<Express> {
  const app: Express = express();

  // For parsing application/json
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());

  // Routes
  app.use("/", await aboutRouter());
  app.use("/annotatequestion", await annotateQuestionRouter(options.handler));
  app.use("/health", await healthRouter());

  // body parser error handler
  app.use(errorRequestHandler);

  // Generate service configurations
  const config = await QanaryComponentCoreServiceConfig.create();

  // Start app
  const skipRegistration = process.env.SKIP_REGISTRATION === "true";
  app.listen(config.springBootAdminClientInstanceServiceBaseUrl.port, async () => {
    // Initialize services
    console.log(`Started Qanary component at ${config.springBootAdminClientInstanceServiceBaseUrl}`);
    if (!skipRegistration) {
      await registrationService(config);
    }
  });

  // Export app
  return app;
}
