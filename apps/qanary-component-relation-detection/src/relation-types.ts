export const KNOWN_RELATION_TYPES = [
  "UNKNOWN",
  "AMOUNT_WATERED_DISTRICT",
  "AMOUNT_SPONSORED_TREES",
  "WATERABLE_TREES_AT_ADDRESS",
  "TREES_BY_SPECIES_DISTRICT",
  "WATERABLE_TREES_AT_KITA",
  "AMOUNT_WATERED_BY_SPECIES",
  "AMOUNT_WATERED_BY_STREET",
  "WATERING_FREQUENCY_BY_SPECIES",
  "NEWLY_PLANTED_TREES_WATERED",
  "AMOUNT_SPONSORED_TREES_DISTRICT",
  "TREES_PLANNED_REPLANTING_DISTRICT",
  "LARGEST_TREES_BY_DISTRICT",
  "KITA_CAPACITY_BY_DISTRICT",
  "TREES_BY_SPECIES_AT_KITA",
  "WATERABLE_TREES_BY_KITA_PROVIDER",
  "TREES_BY_STREET_MAINTENANCE",
  "TREES_ON_WINTER_SERVICE_ROUTES",
] as const;

export type KnownRelationType = (typeof KNOWN_RELATION_TYPES)[number];

const RELATION_TYPE_EXPLANATIONS: Record<KnownRelationType, string> = {
  UNKNOWN: "The question does not clearly match any supported relation type.",
  AMOUNT_WATERED_DISTRICT: "Asks for watering amount, volume, or count in a district.",
  AMOUNT_SPONSORED_TREES: "Asks for the amount of sponsored trees.",
  WATERABLE_TREES_AT_ADDRESS:
    "Asks which trees can be watered near a specific address (havent been watered for one year).",
  TREES_BY_SPECIES_DISTRICT: "Asks for trees by species within a district.",
  WATERABLE_TREES_AT_KITA:
    "Asks which trees can be watered near a specific kindergarten (havent been watered for one year).",
  // --- New Watering & Tree Combinations ---
  AMOUNT_WATERED_BY_SPECIES: "Asks for the total amount or volume of water applied to a specific tree species.",
  AMOUNT_WATERED_BY_STREET: "Asks for the cumulative water applied to trees along a specific street.",
  WATERING_FREQUENCY_BY_SPECIES: "Asks for the total number of watering events (count, not volume) for a specific species.",
  NEWLY_PLANTED_TREES_WATERED: "Asks for watering records of recently planted or young trees based on their planting year.",

  // --- New Tree Characteristics ---
  AMOUNT_SPONSORED_TREES_DISTRICT: "Asks for the amount of sponsored/adopted trees within a specific district.",
  TREES_PLANNED_REPLANTING_DISTRICT: "Asks for trees marked for planned replanting within a specific district or street.",
  LARGEST_TREES_BY_DISTRICT: "Asks to find the largest trees by stem diameter or circumference in a specific area.",

  // --- New Kita & Infrastructure Types ---
  KITA_CAPACITY_BY_DISTRICT: "Asks for the total child capacity of kindergartens within a specific district.",
  TREES_BY_SPECIES_AT_KITA: "Asks to identify the species of trees located near a specific kindergarten.",
  WATERABLE_TREES_BY_KITA_PROVIDER: "Asks for trees needing water near kindergartens run by a specific provider.",
  TREES_BY_STREET_MAINTENANCE: "Asks about trees located on streets maintained by a specific authority (Baulast).",
  TREES_ON_WINTER_SERVICE_ROUTES: "Asks about trees on streets classified under a specific winter service category."
};

export const getRelationTypeExplanation = (relationType: KnownRelationType): string => {
  return RELATION_TYPE_EXPLANATIONS[relationType];
};
