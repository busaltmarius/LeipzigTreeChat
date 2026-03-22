import type { KnownRelationType } from "../../qanary-component-relation-detection/src/relation-types.ts";

export type SparqlPlaceholderName =
  | "district"
  | "species"
  | "street"
  | "streetName"
  | "streetNumber"
  | "zip"
  | "city"
  | "kitaUrn"
  | "providerName"
  | "maintenanceAuthority"
  | "winterCategory"
  | "recentYear"
  | "limit"
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
  AMOUNT_SPONSORED_TREES: `
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>

    SELECT (COUNT(DISTINCT ?tree) AS ?treeCount)
    WHERE {
      ?tree a bk_vocab:Tree ;
            bk_vocab:status_patenbaum ?patenStatus .

      FILTER(STR(?patenStatus) = "vergeben") 
    }`,
  WATERABLE_TREES_AT_ADDRESS: `
    PREFIX geo1: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?treeName ?treeXRaw ?treeYRaw ?treeStreet
    WHERE {
      BIND({{utmAddressCoordinatesY}} AS ?centerY)
      BIND({{utmAddressCoordinatesX}} AS ?centerX)
      
      BIND(250.0 AS ?r) # 250 meters radius

      ?tree a bk_vocab:Tree ;
            geo1:lat ?treeYRaw ;
            geo1:long ?treeXRaw ;
            bk_vocab:ga_id ?speciesResource .

      ?speciesResource a bk_vocab:Species ;
            ga_lang_deutsch ?treeName .

      OPTIONAL { ?tree bk_vocab:strasse ?treeStreet . }
            
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
    PREFIX geo1: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT ?treeId ?treeName ?treeXRaw ?treeYRaw ?treeStreet
    WHERE {
    # 1. Match the tree species
    ?tree a bk_vocab:Tree ;
            bk_vocab:gattung {{species}} ;
            geo1:lat ?treeYRaw ;
            geo1:long ?treeXRaw ;
            bk_vocab:baumnummer ?treeId .

    OPTIONAL { ?tree bk_vocab:ga_lang_deutsch ?treeNameDe . }
    OPTIONAL { ?tree bk_vocab:ga_lang_wiss ?treeNameWiss . }
    OPTIONAL { ?tree bk_vocab:gattung ?treeNameGattung . }
    BIND(COALESCE(?treeNameDe, ?treeNameWiss, ?treeNameGattung) AS ?treeName)

    OPTIONAL { ?tree bk_vocab:strasse ?treeStreet . }
            
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

    SELECT ?treeName ?treeStreet ?treeXRaw ?treeYRaw
    WHERE {
    # 1. Dynamically grab the Kita's coordinates
    {{kitaUrn}} a kita_vocab:Kita ;
            geo1:lat ?kitaYRaw ;
            geo1:long ?kitaXRaw .
            
    BIND(xsd:double(?kitaYRaw) AS ?kitaY)
    BIND(xsd:double(?kitaXRaw) AS ?kitaX)
    
    # Radius in meters
    BIND(250.0 AS ?r) # 250 meters radius

    # 2. Grab the trees and their coordinates
    ?tree a bk_vocab:Tree ;
            geo1:lat ?treeYRaw ;
            geo1:long ?treeXRaw .

        OPTIONAL { ?tree bk_vocab:ga_lang_deutsch ?treeNameDe . }
        OPTIONAL { ?tree bk_vocab:ga_lang_wiss ?treeNameWiss . }
        OPTIONAL { ?tree bk_vocab:gattung ?treeNameGattung . }
        BIND(COALESCE(?treeNameDe, ?treeNameWiss, ?treeNameGattung) AS ?treeName)

    OPTIONAL { ?tree bk_vocab:strasse ?treeStreet . }
            
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
  UNKNOWN: ``,
  // --- New Watering & Tree Combinations ---

  AMOUNT_WATERED_BY_SPECIES: `
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>

    SELECT (SUM(?amount) AS ?totalWateredVolume) (COUNT(?record) AS ?totalWateredCount)
    WHERE {
        ?record a lg_vocab:WateringRecord ;
          lg_vocab:artdtsch {{species}} ;
                lg_vocab:wassermenge ?amount .
    }`,

  AMOUNT_WATERED_BY_STREET: `
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>

    SELECT (SUM(?amount) AS ?totalWateredVolume) (COUNT(?record) AS ?totalWateredCount)
    WHERE {
        ?record a lg_vocab:WateringRecord ;
                lg_vocab:strname {{streetName}} ;
                lg_vocab:wassermenge ?amount .
    }`,

  WATERING_FREQUENCY_BY_SPECIES: `
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>

    SELECT (SUM(?count) AS ?totalWateringEvents)
    WHERE {
        ?record a lg_vocab:WateringRecord ;
          lg_vocab:artdtsch {{species}} ;
                lg_vocab:anzahlg ?count .
    }`,

  NEWLY_PLANTED_TREES_WATERED: `
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>

    SELECT ?recordId ?amount ?plantingYear
    WHERE {
        ?record a lg_vocab:WateringRecord ;
                lg_vocab:id ?recordId ;
                lg_vocab:wassermenge ?amount ;
                lg_vocab:pflanzjahr ?plantingYear .
        FILTER(?plantingYear >= {{recentYear}})
    }`,

  // --- New Tree Characteristics ---

  AMOUNT_SPONSORED_TREES_DISTRICT: `
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT (COUNT(DISTINCT ?tree) AS ?treeCount)
    WHERE {
      ?tree a bk_vocab:Tree ;
            bk_vocab:status_patenbaum ?patenStatus .
      FILTER(STR(?patenStatus) = "vergeben") 

      # Follow mapping node to connect Tree to Watering Record for district data
      ?mappingNode owl:sameAs ?tree .
      ?mappingNode owl:sameAs ?wateringRecord .
      
      ?wateringRecord a lg_vocab:WateringRecord ;
                      lg_vocab:bezirk {{district}} .
    }`,

  TREES_PLANNED_REPLANTING_DISTRICT: `
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT (COUNT(DISTINCT ?tree) AS ?treeCount)
    WHERE {
      ?tree a bk_vocab:Tree ;
            bk_vocab:nachpflanzung_geplant ?planned .
      FILTER(STR(?planned) = "ja") 

      ?mappingNode owl:sameAs ?tree .
      ?mappingNode owl:sameAs ?wateringRecord .
      
      ?wateringRecord a lg_vocab:WateringRecord ;
                      lg_vocab:bezirk {{district}} .
    }`,

  LARGEST_TREES_BY_DISTRICT: `
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX lg_vocab: <urn:de:leipzig:trees:vocab:leipziggiesst:>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT ?treeId ?diameter ?species
    WHERE {
      ?tree a bk_vocab:Tree ;
            bk_vocab:baumnummer ?treeId ;
            bk_vocab:st_durchm ?diameter .
      OPTIONAL { ?tree bk_vocab:ga_lang_deutsch ?species . }

      ?mappingNode owl:sameAs ?tree .
      ?mappingNode owl:sameAs ?wateringRecord .
      
      ?wateringRecord a lg_vocab:WateringRecord ;
                      lg_vocab:bezirk {{district}} .
    }
    ORDER BY DESC(?diameter)
    LIMIT {{limit}}`,

  // --- New Kita & Infrastructure Types ---

  KITA_CAPACITY_BY_DISTRICT: `
    PREFIX kita_vocab: <urn:de:leipzig:trees:vocab:kitas:>

    SELECT (SUM(?capacity) AS ?totalCapacity) (COUNT(?kita) AS ?kitaCount)
    WHERE {
        ?kita a kita_vocab:Kita ;
              kita_vocab:ortsteil {{district}} ;
              kita_vocab:gesamtkap ?capacity .
    }`,

  TREES_BY_SPECIES_AT_KITA: `
    PREFIX geo1: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX kita_vocab: <urn:de:leipzig:trees:vocab:kitas:>

    SELECT ?treeNameDe (COUNT(?tree) AS ?speciesCount)
    WHERE {
      {{kitaUrn}} a kita_vocab:Kita ;
              geo1:lat ?kitaYRaw ;
              geo1:long ?kitaXRaw .
              
      BIND(xsd:double(?kitaYRaw) AS ?kitaY)
      BIND(xsd:double(?kitaXRaw) AS ?kitaX)
      BIND(250.0 AS ?r) 

      ?tree a bk_vocab:Tree ;
            geo1:lat ?treeYRaw ;
            geo1:long ?treeXRaw ;
            bk_vocab:ga_lang_deutsch ?treeNameDe .
              
      BIND(xsd:double(?treeYRaw) AS ?treeY)
      BIND(xsd:double(?treeXRaw) AS ?treeX)

      FILTER(?treeY >= (?kitaY - ?r) && ?treeY <= (?kitaY + ?r))
      FILTER(?treeX >= (?kitaX - ?r) && ?treeX <= (?kitaX + ?r))

      BIND((?treeX - ?kitaX) AS ?dx)
      BIND((?treeY - ?kitaY) AS ?dy)
      FILTER((?dx*?dx + ?dy*?dy) <= (?r * ?r))
    }
    GROUP BY ?treeNameDe
    ORDER BY DESC(?speciesCount)`,

  WATERABLE_TREES_BY_KITA_PROVIDER: `
    PREFIX geo1: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX kita_vocab: <urn:de:leipzig:trees:vocab:kitas:>

    SELECT ?kitaName ?treeId ?treeXRaw ?treeYRaw
    WHERE {
      ?kita a kita_vocab:Kita ;
            kita_vocab:traeg_name {{providerName}} ;
            kita_vocab:name_einr ?kitaName ;
            geo1:lat ?kitaYRaw ;
            geo1:long ?kitaXRaw .
              
      BIND(xsd:double(?kitaYRaw) AS ?kitaY)
      BIND(xsd:double(?kitaXRaw) AS ?kitaX)
      BIND(250.0 AS ?r)

      ?tree a bk_vocab:Tree ;
            geo1:lat ?treeYRaw ;
            geo1:long ?treeXRaw ;
            bk_vocab:baumnummer ?treeId .
              
      BIND(xsd:double(?treeYRaw) AS ?treeY)
      BIND(xsd:double(?treeXRaw) AS ?treeX)

      FILTER(?treeY >= (?kitaY - ?r) && ?treeY <= (?kitaY + ?r))
      FILTER(?treeX >= (?kitaX - ?r) && ?treeX <= (?kitaX + ?r))

      BIND((?treeX - ?kitaX) AS ?dx)
      BIND((?treeY - ?kitaY) AS ?dy)
      FILTER((?dx*?dx + ?dy*?dy) <= (?r * ?r))
    }`,

  TREES_BY_STREET_MAINTENANCE: `
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX str_vocab: <urn:de:leipzig:trees:vocab:strassennetz:>

    SELECT ?treeId ?streetName
    WHERE {
      # Match tree street to road segment street by name string
      ?tree a bk_vocab:Tree ;
            bk_vocab:strasse ?streetName ;
            bk_vocab:baumnummer ?treeId .

      ?road a str_vocab:RoadSegment ;
            str_vocab:str ?streetName ;
            str_vocab:baulast {{maintenanceAuthority}} .
    }`,

  TREES_ON_WINTER_SERVICE_ROUTES: `
    PREFIX bk_vocab: <urn:de:leipzig:trees:vocab:baumkataster:>
    PREFIX str_vocab: <urn:de:leipzig:trees:vocab:strassennetz:>

    SELECT (COUNT(DISTINCT ?tree) AS ?treeCount)
    WHERE {
      ?tree a bk_vocab:Tree ;
            bk_vocab:strasse ?streetName .

      ?road a str_vocab:RoadSegment ;
            str_vocab:str ?streetName ;
            str_vocab:wintkat {{winterCategory}} .
    }`,
};

const REQUIRED_PLACEHOLDERS_BY_RELATION_TYPE: Partial<Record<KnownRelationType, SparqlPlaceholderName[]>> = {
  AMOUNT_WATERED_DISTRICT: ["district"],
  AMOUNT_SPONSORED_TREES: [],
  WATERABLE_TREES_AT_ADDRESS: ["utmAddressCoordinatesX", "utmAddressCoordinatesY"],
  TREES_BY_SPECIES_DISTRICT: ["species", "district"],
  WATERABLE_TREES_AT_KITA: ["kitaUrn"],
  AMOUNT_WATERED_BY_SPECIES: ["species"],
  AMOUNT_WATERED_BY_STREET: ["streetName"],
  WATERING_FREQUENCY_BY_SPECIES: ["species"],
  NEWLY_PLANTED_TREES_WATERED: ["recentYear"],
  AMOUNT_SPONSORED_TREES_DISTRICT: ["district"],
  TREES_PLANNED_REPLANTING_DISTRICT: ["district"],
  LARGEST_TREES_BY_DISTRICT: ["district", "limit"],
  KITA_CAPACITY_BY_DISTRICT: ["district"],
  TREES_BY_SPECIES_AT_KITA: ["kitaUrn"],
  WATERABLE_TREES_BY_KITA_PROVIDER: ["providerName"],
  TREES_BY_STREET_MAINTENANCE: ["maintenanceAuthority"],
  TREES_ON_WINTER_SERVICE_ROUTES: ["winterCategory"],
  UNKNOWN: [],
};

export const getSparqlTemplate = (relationType: KnownRelationType): string | null => {
  return PREDEFINED_SPARQL_BY_RELATION_TYPE[relationType] ?? null;
};

export const getRequiredPlaceholders = (relationType: KnownRelationType): SparqlPlaceholderName[] => {
  return REQUIRED_PLACEHOLDERS_BY_RELATION_TYPE[relationType] ?? [];
};
