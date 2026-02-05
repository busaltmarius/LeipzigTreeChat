import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  createAnnotationInKnowledgeGraph,
  getEndpoint,
  getInGraph,
  type IAnnotationInformation,
  selectSparql,
} from "@leipzigtreechat/qanary-component-helpers";
import { type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";
import { RELATION_TYPE } from "../../qanary-component-relation-detection/src/handler";
/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
// eslint-disable-next-line sonarjs/no-invariant-returns
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  console.log(message);

  const graphId = getInGraph(message);

  const getDataQuery = `
  SELECT ?relationType WHERE {
    GRAPH <${graphId}> {
      ?relationAnnotationId a <urn:qanary#AnnotationOfRelation> ;
        <http://www.w3.org/ns/openannotation/core/hasBody> ?relationType .
    }
  }
  `;

  const relationResponse = await selectSparql("http://localhost:8890/sparql", getDataQuery);

  console.log(`relationResponse: \n${JSON.stringify(relationResponse, null, 2)}\n`);

  const relation = relationResponse[0]?.relationType.value ?? null;
  //const entityId = relationResponse[0]?.entityId.value ?? null;

  console.log(`relation: ${relation}`);

  const getAnswerQuery = await mapDataToTemplate(relation);

  console.log(`getAnswerQuery: \n${getAnswerQuery}\n`);

  if (getAnswerQuery) {
    const sparqlAnnotation: IAnnotationInformation = {
      value: getAnswerQuery,
      range: { start: 0, end: 0 },
      confidence: 1,
    };

    const componentName = "qanary-component-sparql-generation";
    /*await createAnnotationInKnowledgeGraph({
      message: message,
      componentName: componentName,
      annotation: sparqlAnnotation,
      annotationType: QANARY_PREFIX + "AnnotationOfSparqlQuery",
    });*/

    const answerResponse = await getAnswer(relation); //await selectSparql("localhost:8000/", getAnswerQuery);

    const answerAnnotation = await getAnswerAnnotation(relation, answerResponse);

    console.log(`answerResponse:\n${JSON.stringify(answerAnnotation, null, 2)}\n`);

    await createAnnotationInKnowledgeGraph({
      message: message,
      componentName: componentName,
      annotation: answerAnnotation,
      annotationType: QANARY_PREFIX + "AnnotationOfAnswer",
    });
  }

  console.log("Done");

  return message;
};

const getAnswer = async (relation: string | null): Promise<Array<Record<string, unknown>>> => {
  if (relation == null) return [];

  if (relation == RELATION_TYPE.AMOUNT_WATERED_DISTRICT) {
    return [
      {
        amount: {
          type: "literal",
          value: "77",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "34",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "60",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "50",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "60",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "160",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "40",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "160",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "30",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "348",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "5",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "10",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "35",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "40",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "17",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "36",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "8",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "72",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "96",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "144",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "312",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "300",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "135",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "300",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "20",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "60",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "30",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "28",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "20",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "38",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "89",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "70",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "5",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "15",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "28",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "134",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "253",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "583",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "760",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "13",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "25",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "25",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "7",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "10",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "70",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "60",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "80",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "10",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "45",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "63",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "45",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "50",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "340",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "370",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "30",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "200",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "110",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        amount: {
          type: "literal",
          value: "120",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
    ];
  } else if (relation == RELATION_TYPE.WATER_INTAKE_ADDRESS) {
    return [];
  } else if (relation == RELATION_TYPE.WATER_TREE_AT_ADDRESS_AT_DATE) {
    return [
      {
        lat: {
          type: "literal",
          value: "5687809.0",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        long: {
          type: "literal",
          value: "316924.1",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        number: {
          type: "literal",
          value: "33787",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        lat: {
          type: "literal",
          value: "5688965.0",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        long: {
          type: "literal",
          value: "317009.5",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        number: {
          type: "literal",
          value: "34079",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        lat: {
          type: "literal",
          value: "5689500.0",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        long: {
          type: "literal",
          value: "317036.2",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        number: {
          type: "literal",
          value: "34209",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        lat: {
          type: "literal",
          value: "5688805.0",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        long: {
          type: "literal",
          value: "317001.6",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        number: {
          type: "literal",
          value: "34051",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
      {
        lat: {
          type: "literal",
          value: "5688625.0",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        long: {
          type: "literal",
          value: "316968.3",
          datatype: "http://www.w3.org/2001/XMLSchema#double",
        },
        number: {
          type: "literal",
          value: "33965",
          datatype: "http://www.w3.org/2001/XMLSchema#integer",
        },
      },
    ];
  } else if (relation == RELATION_TYPE.DESCRIBE_TREES_REGION) {
    return [
      {
        species: {
          type: "literal",
          value: "Liriodendron",
        },
      },
      {
        species: {
          type: "literal",
          value: "Sorbus",
        },
      },
      {
        species: {
          type: "literal",
          value: "waldartiger",
        },
      },
      {
        species: {
          type: "literal",
          value: "Salix",
        },
      },
      {
        species: {
          type: "literal",
          value: "Populus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Quercus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Acer",
        },
      },
      {
        species: {
          type: "literal",
          value: "Juglans",
        },
      },
      {
        species: {
          type: "literal",
          value: "Fraxinus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Pyrus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Alnus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Ulmus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Prunus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Robinia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Tilia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Betula",
        },
      },
      {
        species: {
          type: "literal",
          value: "Magnolia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Fagus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Larix",
        },
      },
      {
        species: {
          type: "literal",
          value: "Carpinus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Celtis",
        },
      },
      {
        species: {
          type: "literal",
          value: "Ginkgo",
        },
      },
      {
        species: {
          type: "literal",
          value: "Zelkova",
        },
      },
      {
        species: {
          type: "literal",
          value: "Morus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Platanus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Carya",
        },
      },
      {
        species: {
          type: "literal",
          value: "Pinus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Liquidambar",
        },
      },
      {
        species: {
          type: "literal",
          value: "Sophora",
        },
      },
      {
        species: {
          type: "literal",
          value: "Catalpa",
        },
      },
      {
        species: {
          type: "literal",
          value: "Sequoiadendron",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cercidiphyllum",
        },
      },
      {
        species: {
          type: "literal",
          value: "nicht",
        },
      },
      {
        species: {
          type: "literal",
          value: "Pterocarya",
        },
      },
      {
        species: {
          type: "literal",
          value: "Laurus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Taxodium",
        },
      },
      {
        species: {
          type: "literal",
          value: "Gleditsia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Koelreuteria",
        },
      },
      {
        species: {
          type: "literal",
          value: "Pseudotsuga",
        },
      },
      {
        species: {
          type: "literal",
          value: "Picea",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cedrus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Metasequoia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Taxus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Thuja",
        },
      },
      {
        species: {
          type: "literal",
          value: "Ilex",
        },
      },
      {
        species: {
          type: "literal",
          value: "Parrotia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Nothofagus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Nyssa",
        },
      },
      {
        species: {
          type: "literal",
          value: "Tetradium",
        },
      },
      {
        species: {
          type: "literal",
          value: "Paulownia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Eucommia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Aesculus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Gymnocladus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Phellodendron",
        },
      },
      {
        species: {
          type: "literal",
          value: "Rhamnus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Castanea",
        },
      },
      {
        species: {
          type: "literal",
          value: "Abies",
        },
      },
      {
        species: {
          type: "literal",
          value: "Rhododendron",
        },
      },
      {
        species: {
          type: "literal",
          value: "Malus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Corylus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Ailanthus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Crataegus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Chamaecyparis",
        },
      },
      {
        species: {
          type: "literal",
          value: "Laburnum",
        },
      },
      {
        species: {
          type: "literal",
          value: "Juniperus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Amelanchier",
        },
      },
      {
        species: {
          type: "literal",
          value: "Syringa",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cornus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Sambucus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Rhus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Tsuga",
        },
      },
      {
        species: {
          type: "literal",
          value: "Hamamelis",
        },
      },
      {
        species: {
          type: "literal",
          value: "Viburnum",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cuppressus",
        },
      },
      {
        species: {
          type: "literal",
          value: "unbekannt",
        },
      },
      {
        species: {
          type: "literal",
          value: "Thujopsis",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cydonia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cupressocyparis",
        },
      },
      {
        species: {
          type: "literal",
          value: "Ostrya",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cotinus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Mespilus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cercis",
        },
      },
      {
        species: {
          type: "literal",
          value: "Caragana",
        },
      },
      {
        species: {
          type: "literal",
          value: "Lonicera",
        },
      },
      {
        species: {
          type: "literal",
          value: "Unklar",
        },
      },
      {
        species: {
          type: "literal",
          value: "Davidia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Bestandsfläche",
        },
      },
      {
        species: {
          type: "literal",
          value: "Tamarix",
        },
      },
      {
        species: {
          type: "literal",
          value: "Ptelea",
        },
      },
      {
        species: {
          type: "literal",
          value: "Cladrastis",
        },
      },
      {
        species: {
          type: "literal",
          value: "Euonymus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Sequoia",
        },
      },
      {
        species: {
          type: "literal",
          value: "Elaeagnus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Hibiscus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Eriolobus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Crataemespilus",
        },
      },
      {
        species: {
          type: "literal",
          value: "Diospyros",
        },
      },
      {
        species: {
          type: "literal",
          value: "Pseudolarix",
        },
      },
      {
        species: {
          type: "literal",
          value: "Hippophae",
        },
      },
    ];
  }
  return [];
};

const mapDataToTemplate = async (relation: string | null): Promise<string> => {
  if (relation == null) return "";

  if (relation == RELATION_TYPE.AMOUNT_WATERED_DISTRICT) {
    return `
    SELECT ?amount
      WHERE {
        ?treeId <urn:de:leipzig:trees:vocab:leipziggiesst:bezirk> "Kleinzschocher" ;
          <urn:de:leipzig:trees:vocab:leipziggiesst:wassersumme> ?amount .
      }
    `;
  } else if (relation == RELATION_TYPE.WATER_INTAKE_ADDRESS) {
    return "";
  } else if (relation == RELATION_TYPE.WATER_TREE_AT_ADDRESS_AT_DATE) {
    return `
    SELECT ?number ?long ?lat
      WHERE {
        ?s <urn:de:leipzig:trees:vocab:baumkataster:strasse> "Karl-Liebknecht-Straße" ;
          <urn:de:leipzig:trees:vocab:baumkataster:baumnummer> ?number ;
          <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long ;
          <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat .
      } 
    `;
  } else if (relation == RELATION_TYPE.DESCRIBE_TREES_REGION) {
    return `
    SELECT DISTINCT ?species
      WHERE {
        ?treeId <urn:de:leipzig:trees:vocab:baumkataster:gattung> ?species .
      }
    `;
  }

  return "";
};

const getAnswerAnnotation = async (relation: string | null, response: any[]): Promise<IAnnotationInformation> => {
  let answer = "";
  if (relation == null) {
    return {
      value: answer,
      range: { start: 0, end: 0 },
      confidence: 1,
    };
  }
  if (relation == RELATION_TYPE.AMOUNT_WATERED_DISTRICT) {
    answer = response.reduce((sum, item) => sum + Number(item.amount?.value || 0), 0).toString();
  } else if (relation == RELATION_TYPE.WATER_INTAKE_ADDRESS) {
    answer = "";
  } else if (relation == RELATION_TYPE.WATER_TREE_AT_ADDRESS_AT_DATE) {
    const list = response.map((item) => ({
      lat: parseFloat(item.lat?.value || "0"),
      long: parseFloat(item.long?.value || "0"),
      number: parseInt(item.number?.value || "0", 10),
    }));
    answer = "Liste von Baeumen mit ihren Koordinaten und Baumnummern: " + JSON.stringify(list);
  } else if (relation == RELATION_TYPE.DESCRIBE_TREES_REGION) {
    answer = response.map((item) => item.species?.value).join(", ");
  }

  return {
    value: answer,
    range: { start: 0, end: 0 },
    confidence: 1,
  };
};
