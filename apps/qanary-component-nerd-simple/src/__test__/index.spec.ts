import { describe, expect, test } from "bun:test";
import { handler } from "../handler";

describe("#Component handler", () => {
  test("handler does not fail", async () => {
    const result = await handler({});
    expect(result).toStrictEqual({});
  });
});
