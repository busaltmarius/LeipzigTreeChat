import { Layer, Logger, LogLevel, ManagedRuntime } from "effect";
import { LLMService, OpenRouter } from "./llm-service.js";
import { FetchHttpClient } from "@effect/platform";

const layer = Layer.mergeAll(
    LLMService.Live.pipe(Layer.provide(OpenRouter.Live)),
    Logger.minimumLogLevel(LogLevel.Debug),
    FetchHttpClient.layer,
);

const LangGraphRuntime = ManagedRuntime.make(layer);

export const runLangGraphRuntime = LangGraphRuntime.runPromise;
