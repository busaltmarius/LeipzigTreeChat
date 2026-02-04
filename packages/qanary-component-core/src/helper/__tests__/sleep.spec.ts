import { describe, expect, spyOn, test } from "bun:test";
import { sleep } from "../sleep.js";

describe("#Component sleep", () => {
  test("should wait 1 sec before resolving", async () => {
    const TIMEOUT_DURATION = 1000;
    const setTimeoutSpy = spyOn(global, "setTimeout");

    sleep(TIMEOUT_DURATION);

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), TIMEOUT_DURATION);
  });
});
