import { sleep } from "../sleep.js";

jest.useFakeTimers();
jest.spyOn(global, "setTimeout");

describe("#Component sleep", () => {
  it("should wait 1 sec before resolving", async () => {
    const TIMEOUT_DURATION = 1000;

    sleep(TIMEOUT_DURATION);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), TIMEOUT_DURATION);
  });
});
