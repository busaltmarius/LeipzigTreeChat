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
  relationType: z
    .enum(KNOWN_RELATION_TYPES)
    .describe(
      "Relation type in SCREAMING_SNAKE_CASE. " +
        "Prefer one of: " +
        KNOWN_RELATION_TYPES.map((relationType) => `${relationType} (${getRelationTypeExplanation(relationType)})`).join(
          ", "
        ) +
        "."
    ),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0.0 and 1.0."),
});

const RELATION_TYPE_PROMPT_LIST = KNOWN_RELATION_TYPES.map(
  (relationType) => `- ${relationType}: ${getRelationTypeExplanation(relationType)}`
).join("\n");

const SYSTEM_PROMPT = `You are a relation detection component in a Qanary question-answering pipeline about urban trees in Leipzig, Germany.

Your task:
- Read the question and classify it into one RELATION_TYPE.

Preferred RELATION_TYPE values:
${RELATION_TYPE_PROMPT_LIST}

Rules:
1. Return exactly one relationType.
2. relationType must be SCREAMING_SNAKE_CASE.
3. If none of the preferred values fit perfectly, return a UNKNOWN relation label.
4. confidence must be in [0,1].`;

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
