import { generateObjectWithRetry, getLlmModel } from "@leipzigtreechat/qanary-component-helpers";
import { z } from "zod";

/**
 * Predefined entity types for the knowledge-graph QA pipeline.
 * These map directly to SPARQL query patterns on the tree knowledge base.
 *
 * The list is intentionally open — the LLM may return any string for types
 * that don't fit a predefined category. The predefined values serve as
 * strong hints so the model uses consistent, query-friendly labels.
 */
export const KNOWN_ENTITY_TYPES = [
  "TREE",
  "KITA",
  "DISTRICT",
  "ZIP",
  "CITY",
  "YEAR",
  "STREET",
  "STREET_NUMBER",
  "DATE",
  "SPECIES",
] as const;

export type KnownEntityType = (typeof KNOWN_ENTITY_TYPES)[number];

/**
 * A single detected and recognised entity.
 */
export interface NerdEntity {
  /** The verbatim text span extracted from the question */
  entity: string;
  /**
   * The entity type.
   * Should be one of the predefined KNOWN_ENTITY_TYPES where possible,
   * but may be any uppercase string for unknown categories.
   */
  type: string;
  /** 0-based character index of the first character of the entity span */
  start: number;
  /** 0-based character index one past the last character of the entity span */
  end: number;
  /** Model confidence for this entity, in [0, 1] */
  confidence: number;
}

/**
 * Full response from the LLM classifier.
 */
export interface NerdResponse {
  entities: NerdEntity[];
}

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const NerdEntitySchema = z.object({
  entity: z
    .string()
    .describe(
      "The verbatim text span from the question that constitutes the entity. " +
        "Must be an exact substring of the question."
    ),
  type: z
    .string()
    .describe(
      "Entity type in SCREAMING_SNAKE_CASE. " +
        "Use one of the predefined types if it fits: " +
        KNOWN_ENTITY_TYPES.join(", ") +
        ". Use any other descriptive SCREAMING_SNAKE_CASE label for unlisted types."
    ),
  start: z
    .number()
    .int()
    .min(0)
    .describe("Zero-based character index of the first character of the entity span in the original question string."),
  end: z
    .number()
    .int()
    .min(1)
    .describe(
      "Zero-based character index one past the last character of the entity span (exclusive end, like String.slice)."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score for this entity detection and type assignment, between 0.0 and 1.0."),
});

const NerdResponseSchema = z.object({
  entities: z
    .array(NerdEntitySchema)
    .describe("All named entities found in the question. " + "Return an empty array if no entities are present."),
});

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a Named Entity Detection and Recognition (NERD) component in a \
knowledge-graph question-answering pipeline for urban tree data in Leipzig, Germany.

Your tasks:
1. DETECT all named entities in the question (people, places, organisations, dates, \
tree species, districts, streets, zip codes, etc.).
2. RECOGNIZE the type of each entity using SCREAMING_SNAKE_CASE labels.

Predefined types (use these when they fit):
- TREE        : A specific tree or tree reference (e.g. "die alte Eiche", "Baum #42")
- SPECIES     : A tree or plant species name (e.g. "Linde", "Quercus robur", "Rosskastanie")
- KITA        : A Kindertagesstätte / daycare facility
- DISTRICT    : A city district or Stadtteil (e.g. "Connewitz", "Gohlis", "Reudnitz")
- ZIP         : A postal code / Postleitzahl (e.g. "04277", "04229")
- CITY        : A city or municipality (e.g. "Leipzig", "Dresden")
- YEAR        : A calendar year (e.g. "2021", "1987")
- STREET      : A street name, with or without number (e.g. "Karl-Liebknecht-Straße", "Hauptstraße")
- STREET_NUMBER: A house or street number (e.g. "132", "17a")
- DATE        : A specific date or relative date expression (e.g. "heute", "2024-03-15", "letzten Dienstag")

For any entity that does not fit a predefined type, invent a concise SCREAMING_SNAKE_CASE label.

Rules:
1. The "entity" field MUST be an exact verbatim substring of the question — copy it character for character.
2. "start" and "end" are character offsets into the original question string (end is exclusive, like JS String.slice).
3. Verify: question.slice(start, end) === entity. If they do not match, correct the offsets.
4. Do not overlap entity spans.
5. Do not include stopwords, articles, or prepositions as standalone entities.
6. Set confidence to reflect how certain you are about both the span boundary and the type.
7. Return an empty entities array if the question contains no named entities worth annotating.`;

// ---------------------------------------------------------------------------
// Offset helpers
// ---------------------------------------------------------------------------

/**
 * Attempts to fix a single entity whose character offsets do not match the
 * question text.
 *
 * Algorithm:
 *  1. Find every occurrence of `entity.entity` (verbatim) in the question.
 *  2. Pick the occurrence whose start index is closest to the originally
 *     reported `entity.start` (handles rare cases where the same substring
 *     appears more than once).
 *  3. Return a new entity object with corrected start/end, or `null` when
 *     the entity text cannot be found anywhere in the question.
 *
 * This repairs a known failure mode of some LLMs (e.g. deepseek-v3.2 via
 * OpenRouter) that return the correct entity text but wrong character offsets.
 */
function correctEntityOffsets(entity: NerdEntity, question: string): NerdEntity | null {
  const occurrences: number[] = [];
  let searchFrom = 0;

  while (true) {
    const idx = question.indexOf(entity.entity, searchFrom);
    if (idx === -1) break;
    occurrences.push(idx);
    searchFrom = idx + 1;
  }

  if (occurrences.length === 0) {
    console.warn(`[nerd-simple] Cannot find entity "${entity.entity}" anywhere in "${question}", dropping.`);
    return null;
  }

  // Pick the occurrence closest to the originally reported start offset.
  const correctedStart = occurrences.reduce((best, idx) =>
    Math.abs(idx - entity.start) < Math.abs(best - entity.start) ? idx : best
  );
  const correctedEnd = correctedStart + entity.entity.length;

  console.warn(
    `[nerd-simple] Auto-corrected offsets for "${entity.entity}": ` +
      `[${entity.start}, ${entity.end}) → [${correctedStart}, ${correctedEnd}) ` +
      `in "${question}"`
  );

  return { ...entity, start: correctedStart, end: correctedEnd };
}

/**
 * Validates and (where possible) repairs the character offsets of every
 * entity returned by the LLM.
 *
 * - Entities whose offsets already match are passed through unchanged.
 * - Entities with wrong offsets are auto-corrected if the entity text can be
 *   found in the question.
 * - Entities whose text does not appear anywhere in the question are dropped.
 */
function sanitiseEntities(entities: NerdEntity[], question: string): NerdEntity[] {
  const result: NerdEntity[] = [];
  let correctedCount = 0;
  let droppedCount = 0;

  for (const entity of entities) {
    if (question.slice(entity.start, entity.end) === entity.entity) {
      // Offsets are already correct.
      result.push(entity);
      continue;
    }

    const fixed = correctEntityOffsets(entity, question);
    if (fixed !== null) {
      result.push(fixed);
      correctedCount++;
    } else {
      droppedCount++;
    }
  }

  if (correctedCount > 0) {
    console.warn(`[nerd-simple] Auto-corrected ${correctedCount} entity/entities with bad offsets.`);
  }
  if (droppedCount > 0) {
    console.warn(`[nerd-simple] Dropped ${droppedCount} entity/entities whose text was not found in the question.`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Classifier function
// ---------------------------------------------------------------------------

/**
 * Calls the LLM to detect and recognise all named entities in a question.
 *
 * Uses {@link generateObjectWithRetry} which transparently handles two common
 * LLM failure modes:
 *  - JSON wrapped in markdown code fences (e.g. claude-3.5-haiku via OpenRouter)
 *  - Up to 3 total LLM calls on parse failures
 *
 * Additionally, entity offsets that are wrong but recoverable (entity text
 * found elsewhere in the question) are auto-corrected rather than dropped.
 *
 * @param question       The natural-language question to analyse.
 * @param modelFactory   Optional model factory override — used in tests to
 *                       avoid calling a real LLM. Defaults to `getLlmModel`.
 * @returns              Detected entities with their types and char offsets,
 *                       or `null` if the LLM call fails.
 */
export const detectAndRecogniseEntities = async (
  question: string,
  modelFactory: () => ReturnType<typeof getLlmModel> = getLlmModel
): Promise<NerdResponse | null> => {
  try {
    const model = modelFactory();

    const { object } = await generateObjectWithRetry({
      model,
      schema: NerdResponseSchema,
      system: SYSTEM_PROMPT,
      prompt: `Detect and recognise all named entities in the following question:\n\n"${question}"`,
    });

    const entities = sanitiseEntities(object.entities, question);

    console.log(`[nerd-simple] Found ${entities.length} entity/entities for "${question}":`, entities);

    return { entities };
  } catch (error) {
    console.error(`[nerd-simple] Failed to detect entities for question "${question}":`, error);
    return null;
  }
};
