/**
 * Entity type configuration for disambiguation
 */

import type { integer } from "yaml-language-server";

/**
 * Supported entity types for disambiguation
 */
export type EntityType = "TREE" | "KITA" | "DISTRICT" /*| "ZIP" | "CITY" | "JAHR"*/;

/**
 * Entity type mapping configuration
 */
export interface EntityTypeConfig {
  entityType: EntityType;
  namespaceUri: string;
  name: string;
  identifier: string;
}

// Entity type prefix used in NER annotations

export const ENTITY_TYPE_PREFIX = "urn:leipzigtreechat:entityType:";

// Entity type configurations

export const ENTITY_TYPE_CONFIGS: Record<EntityType, EntityTypeConfig> = {
  TREE: {
    entityType: "TREE",
    namespaceUri: "baumkataster:",
    name: "ga_lang_deutsch",
    identifier: "Species",
  },
  KITA: {
    entityType: "KITA",
    namespaceUri: "kitas:",
    name: "name_einr",
    identifier: "Kita",
  },

  DISTRICT: {
    entityType: "DISTRICT",
    namespaceUri: "ortsteile:",
    name: "Name",
    identifier: "District",
  },
  /** fehlt in den Daten
  ZIP: {
    entityType: "ZIP"
  },
  CITY: {
    entityType: "CITY"
  },
  JAHR: {
    entityType: "JAHR"
  },
  */
};

// Extract entity type from full URI
export function extractEntityTypeFromUri(entityTypeUri: string): EntityType | null {
  if (!entityTypeUri.startsWith(ENTITY_TYPE_PREFIX)) {
    return null;
  }

  const entityType = entityTypeUri.replace(ENTITY_TYPE_PREFIX, "");

  // Validate it is part of known entities
  if (entityType in ENTITY_TYPE_CONFIGS) {
    return entityType as EntityType;
  }

  return null;
}

// Get entity type configuration

export function getEntityTypeConfig(entityType: EntityType): EntityTypeConfig {
  return ENTITY_TYPE_CONFIGS[entityType];
}

/** 
export function isSupportedEntityType(entityTypeUri: string): boolean {
  const extractedType = extractEntityTypeFromUri(entityTypeUri);
  return extractedType !== null;
}
*/

// Generate SPARQL query for entity type
export function generateEntityQuery(entityType: EntityType): string {
  const config = ENTITY_TYPE_CONFIGS[entityType];
  return `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX ot_vocab: <urn:de:leipzig:trees:vocab:${config.namespaceUri}>


  SELECT ?urn ?name
  WHERE {
    ?urn rdf:type ot_vocab:${config.identifier};
    ot_vocab:${config.name} ?name.
  }
`;
}
