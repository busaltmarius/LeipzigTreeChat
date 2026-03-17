import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  getEndpoint,
  getInGraph,
  getOutGraph,
  getQuestionUri,
  selectSparql,
  updateSparql,
} from "@leipzigtreechat/qanary-component-helpers";
import { type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";

/**
 * An event handler for incoming messages of the Qanary pipeline
 * @param message incoming qanary pipeline message
 */
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  const endpointUrl = getEndpoint(message) ?? "";
  const questionUri = (await getQuestionUri(message)) ?? "";

  if (!questionUri || !endpointUrl) {
    console.warn("Missing questionUri or endpointUrl");
    return message;
  }

  const inGraph = getInGraph(message);
  if (!inGraph) {
    console.warn("Missing inGraph");
    return message;
  }

  // 1. Load the relation (AnnotationOfRelation)
  const getRelationQuery = `
    PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
    SELECT ?relationBody WHERE {
      GRAPH <${inGraph}> {
        ?annotation a <${QANARY_PREFIX}AnnotationOfRelation> ;
                    oa:hasTarget <${questionUri}> ;
                    oa:hasBody ?relationBody .
      }
    }
  `;

  let relationUri = "";
  try {
    const relationResponse = await selectSparql<{ relationBody: { value: string } }>(endpointUrl, getRelationQuery);
    relationUri = relationResponse[0]?.relationBody.value ?? "";
  } catch (error) {
    console.error("Error fetching relation:", error);
  }

  if (!relationUri) {
    console.warn("No relation found for question:", questionUri);
    return message;
  }

  console.log("Found relation:", relationUri);

  // 2. Load predefined SPARQL request depending on the relation
  const sparqlQuery = getPredefinedSparql(relationUri);

  if (!sparqlQuery) {
    console.warn("No predefined SPARQL query for relation:", relationUri);
    return message;
  }

  // 3. Send the SPARQL request to the triplestore
  let resultJson = "";
  try {
    const rawResults = await selectSparql<any>(endpointUrl, sparqlQuery);
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

  // 4. Save the result in an AnnotationOfAnswerJson
  await createAnswerAnnotation({
    message,
    resultJson,
    confidence: 1.0,
    componentUri: "urn:leipzigtreechat:component:query_builder",
    annotationType: `${QANARY_PREFIX}AnnotationOfAnswerJson`,
  });

  console.log("Done");
  return message;
};

const getPredefinedSparql = (relationUri: string): string | null => {
  switch (relationUri) {
    case "urn:leipzigtreechat:intent:AMOUNT_WATERED_DISTRICT":
      return `
        SELECT ?amount
        WHERE {
            ?treeId <urn:de:leipzig:trees:vocab:leipziggiesst:bezirk> "Kleinzschocher" ;
                    <urn:de:leipzig:trees:vocab:leipziggiesst:wassersumme> ?amount .
        }
      `;
    case "urn:leipzigtreechat:intent:WATER_TREE_AT_ADDRESS_AT_DATE":
      return `
        SELECT ?number ?long ?lat
        WHERE {
            ?s <urn:de:leipzig:trees:vocab:baumkataster:strasse> "Karl-Liebknecht-Straße" ;
               <urn:de:leipzig:trees:vocab:baumkataster:baumnummer> ?number ;
               <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long ;
               <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat .
        }
      `;
    case "urn:leipzigtreechat:intent:DESCRIBE_TREES_REGION":
      return `
        SELECT DISTINCT ?species
        WHERE {
            ?treeId <urn:de:leipzig:trees:vocab:baumkataster:gattung> ?species .
        }
      `;
    default:
      return null;
  }
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

  try {
    await updateSparql(endpointUrl, annotationQuery);
  } catch (error) {
    console.error("Error creating answer annotation in Qanary triplestore");
    console.error(error);
  }
};
