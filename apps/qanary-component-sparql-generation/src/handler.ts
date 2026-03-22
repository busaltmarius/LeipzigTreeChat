import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  getEndpoint,
  getOutGraph,
  getQuestionUri,
  selectSparql,
  updateSparql,
} from "@leipzigtreechat/qanary-component-helpers";
import { type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";
import proj4 from "proj4";
import { extractCoordinatesFromInstances } from "./extract-coordinates-from-instances.ts";
import { type AnnotationInformation, getAnnotationInformation } from "./get-annotation-information.ts";
import { getSparqlTemplate } from "./get-predefined-sparql.ts";

const KNOWLEDGE_BASE_ENDPOINT = "http://localhost:8000";
const PLACEHOLDER_REGEX = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

const escapeSparqlString = (value: string): string => {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
};

const getBestInstanceValue = (annotationInfo: AnnotationInformation, entityType: string): string => {
  const match = annotationInfo.instances
    .filter((instance) => instance.entityType === entityType)
    .sort((a, b) => b.spotConfidence - a.spotConfidence)[0];

  return match?.exactQuote ?? "";
};

const getBestInstanceUrn = (annotationInfo: AnnotationInformation, entityType: string): string => {
  const match = annotationInfo.instances
    .filter((instance) => instance.entityType === entityType)
    .sort((a, b) => b.instanceConfidence - a.instanceConfidence)[0];

  return match?.entityUrn ?? "";
};

const fillSparqlPlaceholders = (
  queryTemplate: string,
  annotationInfo: AnnotationInformation,
  utmCoordinates: { x: number; y: number } | null
): string => {
  const district = getBestInstanceValue(annotationInfo, "DISTRICT");
  const species = getBestInstanceValue(annotationInfo, "SPECIES");
  const street = getBestInstanceValue(annotationInfo, "STREET");
  const streetNumber = getBestInstanceValue(annotationInfo, "STREET_NUMBER");
  const zip = getBestInstanceValue(annotationInfo, "ZIP");
  const city = getBestInstanceValue(annotationInfo, "CITY");
  const year = getBestInstanceValue(annotationInfo, "YEAR");
  const limit = getBestInstanceValue(annotationInfo, "LIMIT");
  const providerName = getBestInstanceValue(annotationInfo, "PROVIDER");
  const maintenanceAuthority = getBestInstanceValue(annotationInfo, "MAINTENANCE_AUTHORITY");
  const winterCategory = getBestInstanceValue(annotationInfo, "WINTER_CATEGORY");
  const kitaUrn = getBestInstanceUrn(annotationInfo, "KITA");

  const numericPlaceholder = (value: string): string | undefined => {
    if (!value) {
      return undefined;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? `${parsed}` : undefined;
  };
  const currentYear = `${new Date().getFullYear()}`;

  const replacements: Record<string, string | undefined> = {
    district: district ? `"${escapeSparqlString(district)}"` : undefined,
    species: species ? `"${escapeSparqlString(species)}"` : undefined,
    street: street ? `"${escapeSparqlString(street)}"` : undefined,
    streetName: street ? `"${escapeSparqlString(street)}"` : undefined,
    streetNumber: streetNumber ? `"${escapeSparqlString(streetNumber)}"` : undefined,
    zip: zip ? `"${escapeSparqlString(zip)}"` : undefined,
    city: city ? `"${escapeSparqlString(city)}"` : undefined,
    kitaUrn: kitaUrn ? `<${kitaUrn}>` : undefined,
    providerName: providerName ? `"${escapeSparqlString(providerName)}"` : undefined,
    maintenanceAuthority: maintenanceAuthority ? `"${escapeSparqlString(maintenanceAuthority)}"` : undefined,
    winterCategory: winterCategory ? `"${escapeSparqlString(winterCategory)}"` : undefined,
    recentYear: numericPlaceholder(year) ?? currentYear,
    limit: numericPlaceholder(limit) ?? "10",
    utmAddressCoordinatesX: utmCoordinates ? `${utmCoordinates.x}` : undefined,
    utmAddressCoordinatesY: utmCoordinates ? `${utmCoordinates.y}` : undefined,
  };

  return queryTemplate.replace(PLACEHOLDER_REGEX, (_, placeholder: string) => {
    const replacement = replacements[placeholder];
    return replacement !== undefined ? replacement : `{{${placeholder}}}`;
  });
};

const findUnresolvedPlaceholders = (query: string): string[] => {
  const unresolved = new Set<string>();
  for (const match of query.matchAll(PLACEHOLDER_REGEX)) {
    const placeholder = match[1];
    if (placeholder) {
      unresolved.add(placeholder);
    }
  }
  return [...unresolved];
};

/**
 * An event handler for incoming messages of the Qanary pipeline
 * @param message incoming qanary pipeline message
 */
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();
  console.log(`[qanary-component-sparql-generation] started at ${startedAtIso}`);
  const endpointUrl = getEndpoint(message) ?? "";
  const questionUri = (await getQuestionUri(message)) ?? "";

  if (!questionUri || !endpointUrl) {
    console.warn("Missing questionUri or endpointUrl");
    return message;
  }

  console.log("[qanary-component-sparql-generation] question URI:", questionUri);
  console.log("[qanary-component-sparql-generation] endpoint:", endpointUrl);

  // 1. Load the relation type and enriched instances
  const annotationInfo = await getAnnotationInformation(message);
  const { relationType } = annotationInfo;

  if (!relationType) {
    console.warn("No valid relation found for question:", questionUri);
    return message;
  }

  console.log("Found relation:", relationType);
  console.log("[qanary-component-sparql-generation] annotation instances:", annotationInfo.instances.length);

  // 2. Extract coordinates if address components (street, street number, zip) are present
  const coordinates = await extractCoordinatesFromInstances(annotationInfo.instances);
  let utmCoordinates: { x: number; y: number } | null = null;
  if (coordinates) {
    console.log(`Extracted coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
    // Define the Leipzig UTM projection (EPSG:25833)
    const utm33n = "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
    const [x, y] = proj4("EPSG:4326", utm33n, [coordinates.longitude, coordinates.latitude]);
    utmCoordinates = { x, y };
  }

  // 3. Load predefined SPARQL request depending on the relation
  const sparqlTemplate = getSparqlTemplate(relationType);

  if (!sparqlTemplate || sparqlTemplate.trim() === "") {
    console.warn("No predefined SPARQL query for relation:", relationType);
    return message;
  }

  const sparqlQuery = fillSparqlPlaceholders(sparqlTemplate, annotationInfo, utmCoordinates);
  console.log("[qanary-component-sparql-generation] SPARQL template:\n", sparqlTemplate);
  console.log("[qanary-component-sparql-generation] SPARQL query after placeholder replacement:\n", sparqlQuery);
  const unresolvedPlaceholders = findUnresolvedPlaceholders(sparqlQuery);
  if (unresolvedPlaceholders.length > 0) {
    console.error("Unresolved SPARQL placeholders:", unresolvedPlaceholders.join(", "), "for relation", relationType);
    return message;
  }

  // 4. Send the SPARQL request to the triplestore
  let resultJson = "";
  try {
    const rawResults = await selectSparql<any>(KNOWLEDGE_BASE_ENDPOINT, sparqlQuery);
    console.log("[qanary-component-sparql-generation] SPARQL result rows:", rawResults.length);
    const variables = rawResults.length > 0 ? Object.keys(rawResults[0]) : [];
    const bindings = rawResults.map((row) => {
      const binding: any = {};
      for (const [key, val] of Object.entries(row)) {
        binding[key] = val;
      }
      return binding;
    });

    resultJson = JSON.stringify({
      head: { vars: variables },
      results: { bindings: bindings },
    });
  } catch (error) {
    console.error("Error executing predefined SPARQL query:", error);
    return message;
  }

  // 5. Save the result in an AnnotationOfAnswerJson
  await createAnswerAnnotation({
    message,
    resultJson,
    confidence: 1.0,
    componentUri: "urn:leipzigtreechat:component:query_builder",
    annotationType: `${QANARY_PREFIX}AnnotationOfAnswerJson`,
  });

  console.log("Done");
  console.log(`[qanary-component-sparql-generation] ended in ${Date.now() - startedAt}ms`);
  return message;
};

interface ICreateAnswerAnnotationOptions {
  message: IQanaryMessage;
  resultJson: string;
  confidence: number;
  componentUri: string;
  annotationType: string;
}

const createAnswerAnnotation = async ({
  message,
  resultJson,
  confidence,
  componentUri,
  annotationType,
}: ICreateAnswerAnnotationOptions): Promise<void> => {
  const outGraph = getOutGraph(message);
  const endpointUrl = getEndpoint(message);
  const questionUri = await getQuestionUri(message);
  if (!outGraph || !endpointUrl || !questionUri) {
    console.error("[sparql-generation] Missing required data for creating answer annotation:", {
      outGraph,
      endpointUrl,
      questionUri,
    });
    return;
  }

  const normalisedAnnotationType =
    String(annotationType).startsWith("http") || String(annotationType).startsWith("urn:")
      ? `<${annotationType}>`
      : annotationType;

  const annotationQuery = `
PREFIX qa: <http://www.wdaqua.eu/qa#>
PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
INSERT {
  GRAPH <${outGraph}> {
    ?annotation a ${normalisedAnnotationType} ;
      oa:hasTarget <${questionUri}> ;
      oa:hasBody """${resultJson}"""^^xsd:string ;
      oa:score '${confidence}'^^xsd:double ;
      oa:annotatedBy <${componentUri}> ;
      oa:annotatedAt ?time .
  }
}
WHERE {
  BIND (IRI(CONCAT("urn:qanary:annotation:ans-", STRUUID())) AS ?annotation)
  BIND (NOW() AS ?time)
}`;

  console.log("[sparql-generation] answer annotation query:\n", annotationQuery);

  try {
    await updateSparql(endpointUrl, annotationQuery);
  } catch (error) {
    console.error("Error creating answer annotation in Qanary triplestore");
    console.error(error);
  }
};
