import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { QanaryComponentAbout } from "../about.model.js";

describe("#Component QanaryComponentAbout", () => {
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

  test("should create new QanaryComponentAbout instance with default data", async () => {
    // Write empty package.json
    writeFileSync(testPackagePath, JSON.stringify({}));

    // Clear module cache to force re-import
    delete require.cache[testPackagePath];

    const aboutComponent = await QanaryComponentAbout.create();

    expect(aboutComponent).not.toBeNull();
    expect(aboutComponent.name).toStrictEqual("");
    expect(aboutComponent.description).toStrictEqual("");
    expect(aboutComponent.version).toStrictEqual("");
  });

  test("should create new QanaryComponentAbout instance from package info", async () => {
    const mockPkg = {
      name: "test-name",
      description: "test-description",
      version: "test-version",
    };

    // Write test package.json
    writeFileSync(testPackagePath, JSON.stringify(mockPkg));

    // Clear module cache to force re-import
    delete require.cache[testPackagePath];

    const aboutComponent = await QanaryComponentAbout.create();

    expect(aboutComponent).not.toBeNull();
    expect(aboutComponent.name).toStrictEqual(mockPkg.name);
    expect(aboutComponent.description).toStrictEqual(mockPkg.description);
    expect(aboutComponent.version).toStrictEqual(mockPkg.version);
  });
});
