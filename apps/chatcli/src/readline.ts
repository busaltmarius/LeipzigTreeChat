import { Terminal } from "@effect/platform/Terminal";
import { Effect, Either, Option } from "effect";
import { SystemSignalError } from "./system-signal";

/**
 * Reads a line from the terminal with the given prompt.
 * @param prompt The prompt to display to the user.
 * @returns The line read from the terminal. Excludes the newline character.
 */
export const readLine = (prompt: string) =>
  Effect.gen(function* () {
    const terminal = yield* Terminal;
    yield* terminal.display(prompt);
    let line = "";
    const mailbox = yield* terminal.readInput;

    while (true) {
      const message = yield* Effect.either(mailbox.take);
      yield* Effect.logDebug(`Received message: ${JSON.stringify(message)}`);
      if (Either.isRight(message)) {
        const input = message.right;
        if (input.key.name === "c" && input.key.ctrl && !input.key.meta && !input.key.shift) {
          return yield* new SystemSignalError({ signal: "SIGINT" });
        } else if (
          (input.key.name === "d" && input.key.ctrl && !input.key.meta && !input.key.shift) ||
          input.key.name === "return"
        ) {
          break;
        } else if (input.key.name === "backspace") {
          if (line.length > 0) {
            line = line.slice(0, -1);
            yield* deleteLastTerminalChar;
          }
        } else {
          const token = message.right.input.pipe(Option.getOrElse(() => ""));
          yield* terminal.display(token);
          line += token;
        }
      } else {
        break;
      }
    }

    yield* terminal.display("\n");
    return line;
  });

const deleteLastTerminalChar = Effect.flatMap(Terminal, (terminal) => terminal.display("\b \b"));
