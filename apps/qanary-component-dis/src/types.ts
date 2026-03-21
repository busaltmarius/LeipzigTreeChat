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
 * Outcome of a disambiguation attempt, including all candidates above threshold.
 */
export interface DisambiguationOutcome {
  /** The best match, or null if no candidates met the threshold. */
  result: DisambiguationResult | null;
  /** All candidates that met the fuzzy threshold, sorted by similarity descending. */
  candidates: DisambiguationResult[];
}

/**
 * SPARQL binding result interface
 */
export interface SparqlBinding {
  [key: string]: { value: string };
}
