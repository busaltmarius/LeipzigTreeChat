import { describe, expect, test } from "bun:test";
import { getRelation } from "../handler";

describe("getExpectedEntityType", () => {
  test("returns location for 'where' questions", async () => {
    const result = await getRelation("Where is Ulm?");
    expect(result?.toString()).toBe("urn:qanary:eat#location");
  });

  test("returns person for 'who' questions", async () => {
    const result = await getRelation("Who discovered oxygen?");
    expect(result?.toString()).toBe("urn:qanary:eat#person");
  });

  test("returns datetime for 'when' questions", async () => {
    const result = await getRelation("When was the treaty signed?");
    expect(result?.toString()).toBe("urn:qanary:eat#datetime");
  });

  test("returns datetime for 'what time' questions", async () => {
    const result = await getRelation("What time is sunset?");
    expect(result?.toString()).toBe("urn:qanary:eat#datetime");
  });

  test("returns datetime for 'what date' questions", async () => {
    const result = await getRelation("What date is the event?");
    expect(result?.toString()).toBe("urn:qanary:eat#datetime");
  });

  test("returns number for 'how many' questions", async () => {
    const result = await getRelation("How many stations are there?");
    expect(result?.toString()).toBe("urn:qanary:eat#number");
  });

  test("returns number for 'how much' questions", async () => {
    const result = await getRelation("How much rainfall fell?");
    expect(result?.toString()).toBe("urn:qanary:eat#number");
  });

  test("returns null for unmatched questions", async () => {
    const result = await getRelation("Explain the ozone layer.");
    expect(result).toBeNull();
  });
});
