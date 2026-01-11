import { Data } from "effect";

export class InvalidInputError extends Data.TaggedError("InvalidInputError")<{
  reason: string;
}> {}
export class MissingMessageError extends Data.TaggedError("MissingMessageError")<{}> {}
