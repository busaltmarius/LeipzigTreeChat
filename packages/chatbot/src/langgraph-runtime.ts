import { type Effect, Layer, Logger, LogLevel, ManagedRuntime } from "effect";
import { LLMService, OpenRouter } from "./llm-service.js";

const layer = Layer.merge(LLMService.Live.pipe(Layer.provide(OpenRouter.Live)), Logger.minimumLogLevel(LogLevel.Debug));

const LangGraphRuntime = ManagedRuntime.make(layer);

export const runLangGraphRuntime = async <A, E>(effect: Effect.Effect<A, E>) => LangGraphRuntime.runPromise(effect);
