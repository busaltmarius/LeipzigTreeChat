import { FetchHttpClient } from "@effect/platform";
import { Layer, Logger, LogLevel, ManagedRuntime } from "effect";
import { LLMService, OpenRouter } from "./llm-service.js";
import { TriplestoreService } from "./triplestore-service.js";

const layer = Layer.mergeAll(
  LLMService.Live.pipe(Layer.provide(OpenRouter.Live)),
  TriplestoreService.Live,
  Logger.minimumLogLevel(LogLevel.Trace),
  FetchHttpClient.layer
);

const LangGraphRuntime = ManagedRuntime.make(layer);

/**
 * Runs an Effect with the chatbot's live runtime dependencies installed.
 */
export const runLangGraphRuntime = LangGraphRuntime.runPromise;
