import { Data } from "effect";

/**
 * Indicates that a user message failed chatbot-specific validation.
 */
export class InvalidInputError extends Data.TaggedError("InvalidInputError")<{
  /**
   * Human-readable explanation of the validation failure.
   */
  reason: string;
}> {}

/**
 * Indicates that the expected message was missing from the current agent state.
 */
export class MissingMessageError extends Data.TaggedError("MissingMessageError")<{}> {}
