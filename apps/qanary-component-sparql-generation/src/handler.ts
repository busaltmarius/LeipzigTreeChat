import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  createAnnotationInKnowledgeGraph,
  getEndpoint,
  getOutGraph,
  selectSparql,
} from "@leipzigtreechat/qanary-component-helpers";
import { type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";
/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
// eslint-disable-next-line sonarjs/no-invariant-returns
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  console.log(message);

  const graphId = getOutGraph(message);

  const getDataQuery = `
  PREFIX qa: <http://www.wdaqua.eu/qa#>
  PREFIX oa: <http://www.w3.org/ns/openannotation/core/>
  SELECT ?relationType ?entityId WHERE {
    GRAPH <${graphId}> {
      ?relationAnnotationId a qa:AnnotationOfRelation ;
        oa:hasBody ?relationType .
      ?entityAnnotationId a qa:AnnotationOfEntity ;
        oa:hasBody ?entityId .
    }
  }
  `;

  // Step 1: get relation annotation from qanary triplestore
  const relationResponse = await selectSparql({
    endpointUrl: getEndpoint(message),
    query: getDataQuery,
  });

  const relation = relationResponse[0]?.relationType.value ?? null;
  const entityId = relationResponse[0]?.entityId.value ?? null;

  const get_answer_query = await mapDataToTemplate(relation, entityId);

  const componentName = "qanary-component-sparql-generation";
  await createAnnotationInKnowledgeGraph({
    message: message,
    componentName: componentName,
    annotation: {
      value: get_answer_query,
    },
    annotationType: QANARY_PREFIX + "AnnotationOfSparqlQuery",
  });

  const answerResponse = await selectSparql({
    endpointUrl: "localhost:8000",
    query: get_answer_query,
  });

  const answer = getAnswerAnnotations(relation, answerResponse);

  await createAnnotationInKnowledgeGraph({
    message: message,
    componentName: componentName,
    annotation: {
      value: answer,
    },
    annotationType: QANARY_PREFIX + "AnnotationOfAnswer",
  });

  return message;
};

export const mapDataToTemplate = async (relation: string, entityId: string): Promise<string> => {
  if (relation == "Wie viel wurde im Stadteil Kleinzschocher gegossen?") {
    return `
    SELECT ?amount
      WHERE {
        ?treeId <urn:de:leipzig:trees:vocab:leipziggiesst:bezirk> "Kleinzschocher" ;
          <urn:de:leipzig:trees:vocab:leipziggiesst:wassersumme> ?amount .
      }
    `;
  } else if (
    relation == "Welche Wasserentnahme Stellen gibt es in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig?"
  ) {
    return "";
  } else if (
    relation == "Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?"
  ) {
    return `
    SELECT ?number ?long ?lat
      WHERE {
        ?s <urn:de:leipzig:trees:vocab:baumkataster:strasse> "Karl-Liebknecht-Straße" ;
          <urn:de:leipzig:trees:vocab:baumkataster:baumnummer> ?number ;
          <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long ;
          <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat .
      } 
    `;
  } else if (relation == "Was kannst du mir über die Bäume in Leipzig erklären?") {
    return `
    SELECT DISTINCT ?species
      WHERE {
        ?treeId <urn:de:leipzig:trees:vocab:baumkataster:gattung> ?species .
      }
    `;
  }

  return "";
};

export const getAnswerAnnotations = async (relation: string, response: any[]): Promise<string> => {
  let answer = "";

  if (relation == "Wie viel wurde im Stadteil Kleinzschocher gegossen?") {
    answer = response.reduce((sum, item) => sum + Number(item.amount?.value || 0), 0).toString();
  } else if (
    relation == "Welche Wasserentnahme Stellen gibt es in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig?"
  ) {
    answer = "null";
  } else if (
    relation == "Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?"
  ) {
    const list = response.map((item) => ({
      lat: parseFloat(item.lat?.value || "0"),
      long: parseFloat(item.long?.value || "0"),
      number: parseInt(item.number?.value || "0", 10),
    }));
    answer = JSON.stringify(list);
  } else if (relation == "Was kannst du mir über die Bäume in Leipzig erklären?") {
    answer = response.map((item) => item.species?.value).join(", ");
  }

  return JSON.stringify({
    value: answer,
    confidence: 1,
  });
};
