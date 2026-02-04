import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  createAnnotationInKnowledgeGraph,
  type IAnnotationInformation,
} from "@leipzigtreechat/qanary-component-helpers";
//import {getAnnotations, type TODO} from "@leipzigtreechat/qanary-component-helpers";
import { getQuestion, type IQanaryMessage, QANARY_NERD_PREFIX, QANARY_PREFIX } from "@leipzigtreechat/shared";

/**
 * An event handler for incoming messages of the Qanary pipeline
 * Exported only for testing purposes
 * @param message incoming qanary pipeline message
 */
// eslint-disable-next-line sonarjs/no-invariant-returns
export const handler: IQanaryComponentMessageHandler = async (message: IQanaryMessage) => {
  console.log(message);

  const question = await getQuestion(message);
  if (!question) {
    console.warn("No question found in message.");
    return message;
  }
  console.log("Question:", question);

  //Richtiger Aufruf aus DB: const annotations = await getAnnotations(question, `${QANARY_PREFIX}AnnotationOfNerd`);
  type NerdEntity = {
    entity: string;
    entityType: string;
  };

  const entities: Array<NerdEntity> = [
    { entity: "Connewitz", entityType: "Stadtteil" },
    { entity: "132", entityType: "Hausnummer" },
    { entity: "04277", entityType: "Postleitzahl" },
    { entity: "Karl-Liebknecht-Str.", entityType: "Straße" },
    { entity: "heute", entityType: "Datum" },
    { entity: "Leipzig", entityType: "Stadt" },
  ];

  const disAnnotations: IAnnotationInformation[] = [];

  for (const { entity, entityType } of entities) {
    const resolved = await resolveAnnotation(entity, entityType);
    disAnnotations.push(...resolved);
    console.log(`Disambiguation for Entity '${entity}':`, resolved);
  }

  for (const annotation of disAnnotations) {
    await createAnnotationInKnowledgeGraph({
      message: message,
      componentName: "qanary-component-dis",
      annotation,
      annotationType: `${QANARY_PREFIX}AnnotationOfDis`,
    });
  }

  return message;
};

const resolveAnnotation = async (entity: string, entityType: string): Promise<Array<IAnnotationInformation>> => {
  switch (`${entity}|${entityType}`) {
    case "Connewitz|Stadtteil":
      return [
        {
          candidates: [
            {
              urn: "urn:de:leipzig:trees:resource:ortsteile:30",
              confidence: 0.99,
            },
          ],
        },
      ];
    case "Leipzig|Stadt":
      return [
        {
          candidates: [{}],
        },
      ];
    case "Karl-Liebknecht-Str.|Straße":
      return [
        {
          candidates: [{}],
        },
      ];
    case "heute|Datum":
      return [
        {
          candidates: [
            {
              urn: Date.now,
              confidence: 1.0,
            },
          ],
        },
      ];
    default:
      console.warn("Unrecognized entity:", entity);
      return [];
  }
};
