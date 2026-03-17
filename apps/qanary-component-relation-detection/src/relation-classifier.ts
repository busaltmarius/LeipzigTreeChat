import { getLlmModel } from "@leipzigtreechat/qanary-component-helpers";
import { generateObject } from "ai";
import { z } from "zod";

export const KNOWN_RELATION_TYPES = [
  "UNKNOWN",
  "AMOUNT_WATERED_DISTRICT",
  "WATER_INTAKE_ADDRESS",
  "WATER_TREE_AT_ADDRESS_AT_DATE",
  "DESCRIBE_TREES_REGION",
] as const;

export type KnownRelationType = (typeof KNOWN_RELATION_TYPES)[number];

export interface RelationClassification {
  relationType: string;
  confidence: number;
}

const RelationClassificationSchema = z.object({
  relationType: z
    .string()
    .describe("Relation type in SCREAMING_SNAKE_CASE. " + "Prefer one of: " + KNOWN_RELATION_TYPES.join(", ") + "."),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0.0 and 1.0."),
});

const SYSTEM_PROMPT = `You are a relation detection component in a Qanary question-answering pipeline about urban trees in Leipzig, Germany.

Your task:
- Read the question and classify it into one RELATION_TYPE.

Preferred RELATION_TYPE values:
- AMOUNT_WATERED_DISTRICT: asks for watering amount/volume/count in a district.
- WATER_INTAKE_ADDRESS: asks for water intake points near an address.
- WATER_TREE_AT_ADDRESS_AT_DATE: asks which tree can be watered near an address at a date/time expression.
- DESCRIBE_TREES_REGION: asks for descriptive information about trees in a city/region.

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
