import { describe, expect, test } from "bun:test";
import { mapDataToTemplate, getAnswerAnnotations } from "../handler"; // Adjust path as needed

describe("mapDataToTemplate", () => {
  test("returns SPARQL query for Kleinzschocher water amount", async () => {
    const relation = "Wie viel wurde im Stadteil Kleinzschocher gegossen?";
    const result = await mapDataToTemplate(relation, "any-id");
    
    expect(result).toContain("SELECT ?amount");
    expect(result).toContain("Kleinzschocher");
  });

  test("returns empty string for Water Entnahme Stellen", async () => {
    const relation = "Welche Wasserentnahme Stellen gibt es in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig?";
    const result = await mapDataToTemplate(relation, "any-id");
    
    expect(result).toBe("");
  });

  test("returns SPARQL query for trees nearby", async () => {
    const relation = "Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?";
    const result = await mapDataToTemplate(relation, "any-id");
    
    expect(result).toContain("SELECT ?number ?long ?lat");
    expect(result).toContain("Karl-Liebknecht-Straße");
  });

  test("returns SPARQL query for species explanation", async () => {
    const relation = "Was kannst du mir über die Bäume in Leipzig erklären?";
    const result = await mapDataToTemplate(relation, "any-id");
    
    expect(result).toContain("SELECT DISTINCT ?species");
  });

  test("returns empty string for unknown relation", async () => {
    const result = await mapDataToTemplate("Unknown question", "any-id");
    expect(result).toBe("");
  });
});

describe("getAnswerAnnotations", () => {
  test("calculates sum correctly for Kleinzschocher", async () => {
    const relation = "Wie viel wurde im Stadteil Kleinzschocher gegossen?";
    const mockResponse = [
      { amount: { value: "10.5" } },
      { amount: { value: "20" } }
    ];

    const result = await getAnswerAnnotations(relation, mockResponse);
    const parsed = JSON.parse(result);

    expect(parsed.confidence).toBe(1);
    expect(parsed.value).toBe("30.5");
  });

  test("returns 'null' string for Water Entnahme Stellen", async () => {
    const relation = "Welche Wasserentnahme Stellen gibt es in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig?";
    const result = await getAnswerAnnotations(relation, []);
    const parsed = JSON.parse(result);

    expect(parsed.value).toBe("null");
  });

  test("maps and formats tree location data correctly", async () => {
    const relation = "Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?";
    const mockResponse = [
      { 
        lat: { value: "51.3" }, 
        long: { value: "12.3" }, 
        number: { value: "100" } 
      }
    ];

    const result = await getAnswerAnnotations(relation, mockResponse);
    const parsed = JSON.parse(result);
    
    // The 'value' property here is a stringified JSON array
    const internalList = JSON.parse(parsed.value);

    expect(internalList).toHaveLength(1);
    expect(internalList[0]).toEqual({
      lat: 51.3,
      long: 12.3,
      number: 100
    });
  });

  test("joins species names with commas", async () => {
    const relation = "Was kannst du mir über die Bäume in Leipzig erklären?";
    const mockResponse = [
      { species: { value: "Oak" } },
      { species: { value: "Birch" } },
      { species: { value: "Linden" } }
    ];

    const result = await getAnswerAnnotations(relation, mockResponse);
    const parsed = JSON.parse(result);

    expect(parsed.value).toBe("Oak, Birch, Linden");
  });

  test("handles empty/unknown relation safely", async () => {
    const result = await getAnswerAnnotations("Unknown", []);
    const parsed = JSON.parse(result);
    
    expect(parsed.value).toBe("");
    expect(parsed.confidence).toBe(1);
  });
});