import { beforeEach, describe, expect, mock, test } from "bun:test";
import { QANARY_EAT_PREFIX } from "@leipzigtreechat/shared";

// ---------------------------------------------------------------------------
// Mock the eat-classifier module so tests never hit a real LLM.
// We keep a mutable reference so individual tests can override the resolved
// value without re-importing the module.
// ---------------------------------------------------------------------------

let mockClassifyResult: { expectedAnswerType: string; confidence: number; reasoning?: string } | null = null;

mock.module("../eat-classifier.ts", () => {
  const { QANARY_EAT_PREFIX: prefix } = require("@leipzigtreechat/shared");

  return {
    classifyExpectedAnswerType: mock(async () => mockClassifyResult),
    eatTypeToUrl: (eatType: string) => new URL(`${prefix}${eatType}`),
    EAT_TYPES: ["object", "list", "number", "bool", "string", "datetime", "date", "time", "timestamp", "enumeration"],
  };
});

// Import AFTER mocks are registered
const { getExpectedEntityType } = await import("../handler.ts");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const eat = (type: string) => `${QANARY_EAT_PREFIX}${type}`;

const setEat = (type: string, confidence = 1) => {
  mockClassifyResult = { expectedAnswerType: type, confidence };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getExpectedEntityType", () => {
  beforeEach(() => {
    mockClassifyResult = null;
  });

  // --- object ---------------------------------------------------------------

  test("returns object for 'wo' questions", async () => {
    setEat("object");
    const result = await getExpectedEntityType("Wo finde ich den nächsten roten Rohdodendron?");
    expect(result?.toString()).toBe(eat("object"));
  });

  test("returns object for 'wer' questions", async () => {
    setEat("object");
    const result = await getExpectedEntityType("Wer hat diesen Baum gepflanzt?");
    expect(result?.toString()).toBe(eat("object"));
  });

  test("returns object for 'welchen' questions", async () => {
    setEat("object");
    const result = await getExpectedEntityType("Welchen Baum kann ich heute gießen?");
    expect(result?.toString()).toBe(eat("object"));
  });

  // --- datetime -------------------------------------------------------------

  test("returns datetime for 'wann' questions", async () => {
    setEat("datetime");
    const result = await getExpectedEntityType("Wann wurde mein Lieblingsbaum das letzte Mal gegossen?");
    expect(result?.toString()).toBe(eat("datetime"));
  });

  // --- number ---------------------------------------------------------------

  test("returns number for 'wie viele' questions", async () => {
    setEat("number");
    const result = await getExpectedEntityType("Wie viele Bäume gibt es in Reudnitz?");
    expect(result?.toString()).toBe(eat("number"));
  });

  test("returns number for 'wie viel' questions", async () => {
    setEat("number");
    const result = await getExpectedEntityType("Wie viel Regen ist heute in der Karl-Liebknecht-Straße gefallen?");
    expect(result?.toString()).toBe(eat("number"));
  });

  // --- list -----------------------------------------------------------------

  test("returns list for 'welche' questions", async () => {
    setEat("list");
    const result = await getExpectedEntityType("Welche Bäume stehen in Anger-Crottendorf?");
    expect(result?.toString()).toBe(eat("list"));
  });

  // --- bool -----------------------------------------------------------------

  test("returns bool for yes/no questions", async () => {
    setEat("bool");
    const result = await getExpectedEntityType("Steht in der Schillerstraße ein Baum?");
    expect(result?.toString()).toBe(eat("bool"));
  });

  // --- string ---------------------------------------------------------------

  test("returns string for name/label questions", async () => {
    setEat("string");
    const result = await getExpectedEntityType("Wie heißt dieser Baum auf Lateinisch?");
    expect(result?.toString()).toBe(eat("string"));
  });

  // --- date -----------------------------------------------------------------

  test("returns date for calendar date questions", async () => {
    setEat("date");
    const result = await getExpectedEntityType("An welchem Datum wurde dieser Baum gepflanzt?");
    expect(result?.toString()).toBe(eat("date"));
  });

  // --- enumeration ----------------------------------------------------------

  test("returns enumeration for category questions", async () => {
    setEat("enumeration");
    const result = await getExpectedEntityType("Zu welcher Baumart gehört dieser Baum?");
    expect(result?.toString()).toBe(eat("enumeration"));
  });

  // --- null / failure -------------------------------------------------------

  test("returns null when the LLM classifier returns null", async () => {
    mockClassifyResult = null;
    const result = await getExpectedEntityType("Erkläre mir die Photosynthese.");
    expect(result).toBeNull();
  });

  // --- URL shape ------------------------------------------------------------

  test("returns a proper URL instance", async () => {
    setEat("number");
    const result = await getExpectedEntityType("Wie viele Linden gibt es?");
    expect(result).toBeInstanceOf(URL);
  });

  test("returned URL has the correct Qanary EAT prefix", async () => {
    setEat("list");
    const result = await getExpectedEntityType("Welche Parks gibt es in Leipzig?");
    expect(result?.toString()).toStartWith(QANARY_EAT_PREFIX);
  });

  // --- confidence is forwarded (via eatTypeToUrl only cares about type) -----

  test("low-confidence result still returns a valid URL", async () => {
    mockClassifyResult = { expectedAnswerType: "object", confidence: 0.3 };
    const result = await getExpectedEntityType("Was ist das?");
    expect(result?.toString()).toBe(eat("object"));
  });
});
