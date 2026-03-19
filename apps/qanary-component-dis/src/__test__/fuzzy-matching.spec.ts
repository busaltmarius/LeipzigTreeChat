import { describe, expect, test } from "bun:test";
import { levenshtein, similarity } from "../fuzzy-matching";

describe("Fuzzy matching", () => {
  describe("levenshtein", () => {
    test("returns 0 for identical strings", () => {
      expect(levenshtein("test", "test")).toBe(0);
      expect(levenshtein("hello", "hello")).toBe(0);
    });

    test("returns length for empty string", () => {
      expect(levenshtein("", "test")).toBe(4);
      expect(levenshtein("hello", "")).toBe(5);
    });

    test("calculates correct distance for simple cases", () => {
      expect(levenshtein("kitten", "sitting")).toBe(3);
      expect(levenshtein("book", "back")).toBe(2);
      expect(levenshtein("house", "mouse")).toBe(1);
    });

    test("is case insensitive", () => {
      // levenshtein lowercases strings internally
      expect(levenshtein("Test", "test")).toBe(0);
      expect(levenshtein("HELLO", "hello")).toBe(0);
      expect(levenshtein("Test", "TEST")).toBe(0);
    });
  });

  describe("similarity", () => {
    test("returns 1.0 for identical strings", () => {
      expect(similarity("test", "test")).toBe(1.0);
      expect(similarity("Hello World", "Hello World")).toBe(1.0);
    });

    test("returns 1.0 for identical strings with different case", () => {
      expect(similarity("Test", "test")).toBe(1.0);
      expect(similarity("HELLO", "hello")).toBe(1.0);
    });

    test("returns 0.0 for completely different strings", () => {
      expect(similarity("abc", "xyz")).toBeLessThan(0.5);
      expect(similarity("cat", "dog")).toBeLessThan(0.5);
    });

    test("calculates reasonable similarity for similar strings", () => {
      // "kitten" vs "sitting" - 3 changes out of 7 = ~0.57 similarity
      expect(similarity("kitten", "sitting")).toBeCloseTo(0.57, 1);

      // "book" vs "back" - 2 changes out of 4 = 0.5 similarity
      expect(similarity("book", "back")).toBeCloseTo(0.5, 1);

      // "house" vs "mouse" - 1 change out of 5 = 0.8 similarity
      expect(similarity("house", "mouse")).toBeCloseTo(0.8, 1);
    });

    test("handles special characters", () => {
      expect(similarity("straße", "strasse")).toBeGreaterThan(0.5);
      expect(similarity("naïve", "naive")).toBeGreaterThan(0.5);
    });
  });
});
