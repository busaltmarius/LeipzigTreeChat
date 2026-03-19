import type { EntityType } from "./entity-types";

/**
 * NER annotation from the knowledge graph
 */
export interface NerAnnotation {
  annotationUri: string;
  spotResourceUri: string;
  entityType: string;
  score: number;
  exactQuote: string;
  start: number;
  end: number;
  questionUri: string;
}

/**
 * Disambiguation result with matched entity
 */
export interface DisambiguationResult {
  entityUrn: string;
  score: number;
  label: string;
}

/**
 * SPARQL binding result interface
 */
export interface SparqlBinding {
  [key: string]: { value: string };
}
