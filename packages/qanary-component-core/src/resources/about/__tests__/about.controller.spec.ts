import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Request, Response } from "express";

import { readAbout } from "../about.controller.js";

describe("#Component readAbout", () => {
  const STATUS_OK = 200;
  const testPackagePath = join(process.cwd(), "package.json");
  let originalPackage: string | null = null;

  beforeAll(() => {
    // Backup original package.json if it exists
    if (existsSync(testPackagePath)) {
      originalPackage = readFileSync(testPackagePath, "utf-8");
    }
  });

  afterAll(() => {
    // Restore original package.json
    if (originalPackage !== null) {
      writeFileSync(testPackagePath, originalPackage);
    }
  });

  test("should return request handler function", async () => {
    const requestHandler = await readAbout();

    expect(requestHandler).not.toBeNull();
  });

  test("should return request handler that calls res.status and res.json", async () => {
    const mockPkg = {
      name: "test-name",
      description: "test-description",
      version: "test-version",
    };

    // Write test package.json
    writeFileSync(testPackagePath, JSON.stringify(mockPkg));

    // Clear module cache to force re-import
    delete require.cache[testPackagePath];

    const request = {} as Request;

    const response = {} as Response;
    const mockResponseStatus = mock().mockReturnValue(response);
    const mockResponseJson = mock();
    response.status = mockResponseStatus as any;
    response.json = mockResponseJson as any;

    const mockNext = mock();

    const requestHandler = await readAbout();
    await requestHandler(request, response, mockNext);

    expect(mockResponseStatus).toHaveBeenCalledWith(STATUS_OK);
    expect(mockResponseJson).toHaveBeenCalled();
    const callArg = mockResponseJson.mock.calls[0]?.[0];
    expect(callArg?.name).toStrictEqual(mockPkg.name);
    expect(callArg?.description).toStrictEqual(mockPkg.description);
    expect(callArg?.version).toStrictEqual(mockPkg.version);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
