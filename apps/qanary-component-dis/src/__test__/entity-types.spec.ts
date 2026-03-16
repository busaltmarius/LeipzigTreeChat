import { describe, expect, test } from "bun:test";
import {
  ENTITY_TYPE_CONFIGS,
  ENTITY_TYPE_PREFIX,
  extractEntityTypeFromUri,
  generateEntityQuery,
} from "../entity-types";

describe("Entity types", () => {
  describe("ENTITY_TYPE_CONFIGS", () => {
    test("contains configurations for all entity types", () => {
      expect(ENTITY_TYPE_CONFIGS.TREE).toBeDefined();
      expect(ENTITY_TYPE_CONFIGS.KITA).toBeDefined();
      expect(ENTITY_TYPE_CONFIGS.DISTRICT).toBeDefined();
    });

    test("TREE configuration has correct properties", () => {
      const treeConfig = ENTITY_TYPE_CONFIGS.TREE;
      expect(treeConfig.entityType).toBe("TREE");
      expect(treeConfig.namespaceUri).toBe("baumkataster:");
      expect(treeConfig.identifier).toBe("Species");
      expect(treeConfig.name).toBe("ga_lang_deutsch");
    });

    test("KITA configuration has correct properties", () => {
      const kitaConfig = ENTITY_TYPE_CONFIGS.KITA;
      expect(kitaConfig.entityType).toBe("KITA");
      expect(kitaConfig.namespaceUri).toBe("kitas:");
      expect(kitaConfig.identifier).toBe("Kita");
      expect(kitaConfig.name).toBe("name_einr");
    });

    test("DISTRICT configuration has correct properties", () => {
      const districtConfig = ENTITY_TYPE_CONFIGS.DISTRICT;
      expect(districtConfig.entityType).toBe("DISTRICT");
      expect(districtConfig.namespaceUri).toBe("ortsteile:");
      expect(districtConfig.identifier).toBe("District");
      expect(districtConfig.name).toBe("Name");
    });
  });

  describe("extractEntityTypeFromUri", () => {
    test("extracts TREE from full URI", () => {
      expect(extractEntityTypeFromUri(`${ENTITY_TYPE_PREFIX}TREE`)).toBe("TREE");
    });

    test("extracts KITA from full URI", () => {
      expect(extractEntityTypeFromUri(`${ENTITY_TYPE_PREFIX}KITA`)).toBe("KITA");
    });

    test("extracts DISTRICT from full URI", () => {
      expect(extractEntityTypeFromUri(`${ENTITY_TYPE_PREFIX}DISTRICT`)).toBe("DISTRICT");
    });

    test("returns null for invalid prefix", () => {
      expect(extractEntityTypeFromUri("urn:something:else:TREE")).toBeNull();
    });

    test("returns null for unknown entity type", () => {
      expect(extractEntityTypeFromUri(`${ENTITY_TYPE_PREFIX}UNKNOWN`)).toBeNull();
    });

    test("returns null for empty string", () => {
      expect(extractEntityTypeFromUri("")).toBeNull();
    });
  });

  describe("generateEntityQuery", () => {
    test("generates correct query for TREE", () => {
      const query = generateEntityQuery("TREE");
      expect(query).toContain("SELECT ?urn ?name");
      expect(query).toContain("baumkataster:");
      expect(query).toContain("Species");
      expect(query).toContain("ga_lang_deutsch");
    });

    test("generates correct query for KITA", () => {
      const query = generateEntityQuery("KITA");
      expect(query).toContain("SELECT ?urn ?name");
      expect(query).toContain("kitas:");
      expect(query).toContain("Kita");
      expect(query).toContain("name_einr");
    });

    test("generates correct query for DISTRICT", () => {
      const query = generateEntityQuery("DISTRICT");
      expect(query).toContain("SELECT ?urn ?name");
      expect(query).toContain("ortsteile:");
      expect(query).toContain("District");
      expect(query).toContain("Name");
    });

    test("query contains rdf:type pattern", () => {
      const query = generateEntityQuery("TREE");
      expect(query).toContain("rdf:type");
    });

    test("query contains PREFIX declaration", () => {
      const query = generateEntityQuery("TREE");
      expect(query).toContain("PREFIX rdf:");
      expect(query).toContain("PREFIX ot_vocab:");
    });
  });
});