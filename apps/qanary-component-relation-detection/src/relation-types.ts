export const KNOWN_RELATION_TYPES = [
  "UNKNOWN",
  "AMOUNT_WATERED_DISTRICT",
  "SPONSORED_TREES",
  "WATERABLE_TREES_AT_ADDRESS",
  "TREES_BY_SPECIES_DISTRICT",
  "WATERABLE_TREES_AT_KITA",
] as const;

export type KnownRelationType = (typeof KNOWN_RELATION_TYPES)[number];

const RELATION_TYPE_EXPLANATIONS: Record<KnownRelationType, string> = {
  UNKNOWN: "The question does not clearly match any supported relation type.",
  AMOUNT_WATERED_DISTRICT: "Asks for watering amount, volume, or count in a district.",
  SPONSORED_TREES: "Asks for sponsored trees.",
  WATERABLE_TREES_AT_ADDRESS: "Asks which trees can be watered near a specific address (havent been watered for one year).",
  TREES_BY_SPECIES_DISTRICT: "Asks for trees by species within a district.",
  WATERABLE_TREES_AT_KITA: "Asks which trees can be watered near a specific kindergarten (havent been watered for one year).",
};

export const getRelationTypeExplanation = (relationType: KnownRelationType): string => {
  return RELATION_TYPE_EXPLANATIONS[relationType];
};