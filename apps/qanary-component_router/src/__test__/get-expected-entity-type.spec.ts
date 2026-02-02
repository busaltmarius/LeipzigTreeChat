import { describe, expect, test } from "bun:test";
import { getExpectedEntityType } from "../handler";

describe("getExpectedEntityType", () => {
  test("returns object for 'wo' questions", async () => {
    const result = await getExpectedEntityType("Wo finde ich den nächsten roten Rohdodendron?");
    expect(result?.toString()).toBe("urn:qanary:eat#object");
  });

  test("returns object for 'wer' questions", async () => {
    const result = await getExpectedEntityType("Wer hat diesen Baum gepflanzt??");
    expect(result?.toString()).toBe("urn:qanary:eat#object");
  });

  test("returns datetime for 'wann' questions", async () => {
    const result = await getExpectedEntityType("Wann wurde mein Lieblingsbaum das letzte Mal gegossen?");
    expect(result?.toString()).toBe("urn:qanary:eat#datetime");
  });

  test("returns number for 'wie viele' questions", async () => {
    const result = await getExpectedEntityType("Wie viele Bäume gibt es in Reudnitz?");
    expect(result?.toString()).toBe("urn:qanary:eat#number");
  });

  test("returns number for 'wie viel' questions", async () => {
    const result = await getExpectedEntityType("Wie viel Regen ist heute in der Karl-Liebknecht-Straße gefallen?");
    expect(result?.toString()).toBe("urn:qanary:eat#number");
  });

  test("returns list for 'welche' questions", async () => {
    const result = await getExpectedEntityType("Welche Bäume stehen in Anger-Crottendorf?");
    expect(result?.toString()).toBe("urn:qanary:eat#list");
  });

  test("returns object for 'welchen' questions", async () => {
    const result = await getExpectedEntityType("Welchen Baum kann ich heute gießen?");
    expect(result?.toString()).toBe("urn:qanary:eat#object");
  });

  test("returns null for unmatched questions", async () => {
    const result = await getExpectedEntityType("Erkläre mir die Photosynthese.");
    expect(result).toBeNull();
  });
});
