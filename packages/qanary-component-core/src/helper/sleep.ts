/**
 * Sleeps for the provided amount of milliseconds
 * @param ms the amount of milliseconds to sleep
 * @returns a promise that resolves after the provided amount of milliseconds
 */
export const sleep = (ms: number): Promise<unknown> => new Promise((resolve) => setTimeout(resolve, ms));
