import { getLlmModel } from "@leipzigtreechat/qanary-component-helpers";
import { generateObject } from "ai";
import { z } from "zod";
import { getRelationTypeExplanation, KNOWN_RELATION_TYPES, type KnownRelationType } from "./relation-types.ts";

export { getRelationTypeExplanation, KNOWN_RELATION_TYPES, type KnownRelationType } from "./relation-types.ts";

export const KNOWN_RELATION_TYPES_OLD = [
  "UNKNOWN",
  "DESCRIBE_SYSTEM_CAPABILITIES",
  "FIND_SPONSORED_TREES",
  "FIND_SPONSORED_TREES_AT_ADDRESS",
  "FIND_WATERABLE_TREES",
  "FIND_WATERABLE_TREES_AT_ADDRESS",
  "FIND_WATERABLE_TREES_NEAR_KITA",
  "FIND_UNWATERED_TREES_BY_DATE",
  "FIND_UNWATERED_TREES_BY_SPECIES",
  "FIND_TREES_BY_SPECIES_DISTRICT",
  "FIND_TREES_BY_SPECIES_PLANT_DATE",
  "FIND_TREES_WITH_WATERING_HISTORY_AT_ADDRESS",
  "AMOUNT_WATERED_DISTRICT",
  "WATER_INTAKE_ADDRESS",
  "WATER_TREE_AT_ADDRESS_AT_DATE",
  "DESCRIBE_TREES_REGION",
] as const;

export interface RelationClassification {
  relationType: KnownRelationType;
  confidence: number;
}

const RelationClassificationSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "A brief 1-2 sentence explanation of why this relation type fits the German question. " +
      "Analyze the intent and the specific constraints of the question before choosing."
    ),
  relationType: z
    .enum(KNOWN_RELATION_TYPES)
    .describe(
      "Relation type in SCREAMING_SNAKE_CASE. " +
        "Prefer one of: " +
        KNOWN_RELATION_TYPES.map(
          (relationType) => `${relationType} (${getRelationTypeExplanation(relationType)})`
        ).join(", ") +
        "."
    ),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0.0 and 1.0."),
});

const RELATION_TYPE_PROMPT_LIST = KNOWN_RELATION_TYPES.map(
  (relationType) => `- ${relationType}: ${getRelationTypeExplanation(relationType)}`
).join("\n");

const SYSTEM_PROMPT = `
You are a relation detection component in a Qanary question-answering pipeline about urban trees in Leipzig, Germany.

Your task is to read a user question (typically in German) and classify it into one of the predefined relation types.

### CATEGORIES:
${RELATION_TYPE_PROMPT_LIST}

### EXAMPLES:
Question: "Wie viel wurde im Stadtteil Connewitz gegossen?"
Output: {"reasoning": "The user is asking for the amount of watering ('Wie viel wurde... gegossen') located in a specific district ('Connewitz').", "relationType": "AMOUNT_WATERED_DISTRICT", "confidence": 0.95}

Question: "Gibt es Eichen in Plagwitz?"
Output: {"reasoning": "The user is asking about a specific tree species ('Eichen') in a specific district ('Plagwitz').", "relationType": "TREES_BY_SPECIES_DISTRICT", "confidence": 0.90}

Question: "Welche Bäume am Kindergarten 'Sonnenschein' brauchen Wasser?"
Output: {"reasoning": "The user is asking for waterable trees ('brauchen Wasser') near a specific kindergarten ('Kindergarten Sonnenschein').", "relationType": "WATERABLE_TREES_AT_KITA", "confidence": 0.98}

Question: "Wo kann ich gut essen gehen?"
Output: {"reasoning": "The user is asking for restaurant recommendations, which is unrelated to urban trees or watering.", "relationType": "UNKNOWN", "confidence": 0.99}

### RULES:
1. First, provide a brief reasoning for your choice.
2. Select the single best-fitting relationType.
3. Strict adherence: If the question does not perfectly fit one of the core relation types, you MUST return UNKNOWN. Do not guess or force a fit.
4. Assign a realistic confidence score between 0.0 and 1.0. If the question is highly ambiguous, lower the confidence score.
`

export const classifyRelationType = async (
  question: string,
  modelFactory: () => ReturnType<typeof getLlmModel> = getLlmModel
): Promise<RelationClassification | null> => {
  try {
    const model = modelFactory();

    const { object } = await generateObject({
      model,
      schema: RelationClassificationSchema,
      system: SYSTEM_PROMPT,
      prompt: `Classify the relation type for this question:\n\n"${question}"`,
    });

    return object;
  } catch (error) {
    console.error(`[relation-detection] Failed to classify relation for question "${question}":`, error);
    return null;
  }
};
