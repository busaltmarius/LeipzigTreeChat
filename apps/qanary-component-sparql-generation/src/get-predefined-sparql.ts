import type { KnownRelationType } from "../../qanary-component-relation-detection/src/relation-types.ts";

export type SparqlPlaceholderName =
  | "district"
  | "species"
  | "street"
  | "streetNumber"
  | "zip"
  | "city"
  | "kitaUrn"
  | "utmAddressCoordinatesX"
  | "utmAddressCoordinatesY";

const PREDEFINED_SPARQL_BY_RELATION_TYPE: Partial<Record<KnownRelationType, string>> = {
  AMOUNT_WATERED_DISTRICT: `
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>

    SELECT (SUM(?amount) AS ?totalWateredVolume) (COUNT(?record) AS ?totalWateredCount)
    WHERE {
        ?record a lg_vocab:WateringRecord ;
        lg_vocab:bezirk {{district}} ;
        lg_vocab:wassersumme ?amount .
    }`,
  SPONSORED_TREES: `
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>

    SELECT ?tree ?treeName ?street
    WHERE {
    ?tree a bk_vocab:Tree ;
            bk_vocab:ga_lang_deutsch ?treeName ;
            bk_vocab:strasse ?street ;
            bk_vocab:status_patenbaum ?patenStatus .
    
    # Assuming sponsored trees have a non-empty status string
        FILTER(?patenStatus = "vergeben") 
    }`,
  WATERABLE_TREES_AT_ADDRESS: `
    PREFIX geo1: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>

    SELECT ?tree ?treeName
    WHERE {
      BIND({{utmAddressCoordinatesX}} AS ?centerY)
      BIND({{utmAddressCoordinatesY}} AS ?centerX)
      
      BIND(1000.0 AS ?r) # 1km radius

      ?tree a bk_vocab:Tree ;
            geo1:lat ?treeYRaw ;
            geo1:long ?treeXRaw ;
            bk_vocab:ga_lang_deutsch ?treeName .
            
      BIND(xsd:double(?treeYRaw) AS ?treeY)
      BIND(xsd:double(?treeXRaw) AS ?treeX)

      # Fast bounding box filter
      FILTER(?treeY >= (?centerY - ?r) && ?treeY <= (?centerY + ?r))
      FILTER(?treeX >= (?centerX - ?r) && ?treeX <= (?centerX + ?r))

      # Pythagorean distance filter
      BIND((?treeX - ?centerX) AS ?dx)
      BIND((?treeY - ?centerY) AS ?dy)
      FILTER((?dx*?dx + ?dy*?dy) <= (?r * ?r))
    }`,
  TREES_BY_SPECIES_DISTRICT: `
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT ?tree ?treeId
    WHERE {
    # 1. Match the tree species
    ?tree a bk_vocab:Tree ;
            bk_vocab:ga_lang_deutsch {{species}} ;
            bk_vocab:baumnummer ?treeId .
            
    # 2. Follow the mapping node that connects the Tree to the Watering Record
    ?mappingNode owl:sameAs ?tree .
    ?mappingNode owl:sameAs ?wateringRecord .
    
    # 3. Match the district string on the Watering Record
    ?wateringRecord a lg_vocab:WateringRecord ;
                    lg_vocab:bezirk {{district}} .
    }`,
  WATERABLE_TREES_AT_KITA: `
    PREFIX geo1: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX kita_vocab: <urn:de:leipzig:trees:vocab:kitas:>

    SELECT ?tree ?treeName
    WHERE {
    # 1. Dynamically grab the Kita's coordinates
    {{kitaUrn}} a kita_vocab:Kita ;
            geo1:lat ?kitaYRaw ;
            geo1:long ?kitaXRaw .
            
    BIND(xsd:double(?kitaYRaw) AS ?kitaY)
    BIND(xsd:double(?kitaXRaw) AS ?kitaX)
    
    # Radius in meters
    BIND(1000.0 AS ?r)

    # 2. Grab the trees and their coordinates
    ?tree a bk_vocab:Tree ;
            bk_vocab:ga_lang_deutsch ?treeName ;
            geo1:lat ?treeYRaw ;
            geo1:long ?treeXRaw .
            
    BIND(xsd:double(?treeYRaw) AS ?treeY)
    BIND(xsd:double(?treeXRaw) AS ?treeX)

    # 3. Fast prefilter (Bounding Box)
    FILTER(?treeY >= (?kitaY - ?r) && ?treeY <= (?kitaY + ?r))
    FILTER(?treeX >= (?kitaX - ?r) && ?treeX <= (?kitaX + ?r))

    # 4. Math: Euclidean distance squared 
    BIND((?treeX - ?kitaX) AS ?dx)
    BIND((?treeY - ?kitaY) AS ?dy)
    BIND((?dx*?dx + ?dy*?dy) AS ?dist2)

    FILTER(?dist2 <= (?r * ?r))
    }`,
  UNKNOWN: `
  `,
};

const REQUIRED_PLACEHOLDERS_BY_RELATION_TYPE: Partial<Record<KnownRelationType, SparqlPlaceholderName[]>> = {
  AMOUNT_WATERED_DISTRICT: ["district"],
  SPONSORED_TREES: [],
  WATERABLE_TREES_AT_ADDRESS: ["utmAddressCoordinatesX", "utmAddressCoordinatesY"],
  TREES_BY_SPECIES_DISTRICT: ["species", "district"],
  WATERABLE_TREES_AT_KITA: ["kitaUrn"],
  UNKNOWN: [],
};

export const getSparqlTemplate = (relationType: KnownRelationType): string | null => {
  return PREDEFINED_SPARQL_BY_RELATION_TYPE[relationType] ?? null;
};

export const getRequiredPlaceholders = (relationType: KnownRelationType): SparqlPlaceholderName[] => {
  return REQUIRED_PLACEHOLDERS_BY_RELATION_TYPE[relationType] ?? [];
};
