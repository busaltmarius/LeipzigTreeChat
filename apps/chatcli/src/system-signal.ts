import type { Signal } from "@effect/platform/CommandExecutor";
import { Data, Effect } from "effect";

export class SystemSignalError extends Data.TaggedError("SystemSignalError")<{
  signal: Signal;
}> {}

export const handleSystemSignalError = (error: SystemSignalError) =>
  Effect.logInfo(`\nReceived system signal: ${error.signal}. Exiting...`);
