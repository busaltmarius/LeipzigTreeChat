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
          entity: JSON.stringify({
            urn: "urn:de:leipzig:trees:resource:ortsteile:30",
          }),
          confidence: 0.99,
        },
      ];
    case "Leipzig|Stadt":
      return [
        {
          entity: JSON.stringify({
            name: "Leipzig",
            type: "Stadt",
            state: "Sachsen",
            country: "Deutschland",
            canonicalId: "stadt:leipzig",
            geo: {
              lat: 51.3236,
              lon: 12.3222,
            },
          }),
          disambiguation: {
            status: "resolved",
            candidates: [
              {
                canonicalId: "stadt:leipzig",
                confidence: 0.99,
              },
            ],
          },
          range: {
            start: 93,
            end: 100,
          },
        },
      ];
    case "Karl-Liebknecht-Str.|Straße":
      return [
        {
          entity: JSON.stringify({
            name: "Karl-Liebknecht-Str.",
            type: "Straße",
            city: "Leipzig",
            state: "Sachsen",
            country: "Deutschland",
            canonicalId: "street:leipzig:karl-liebknecht-strasse",
            geo: {
              lat: 51.3071,
              lon: 12.3739,
            },
          }),
          disambiguation: {
            status: "resolved_weak_alternatives",
            candidates: [
              {
                canonicalId: "street:leipzig:karl-liebknecht-strasse",
                confidence: 0.95,
              },
              {
                canonicalId: "street:leipzig:karl-heine-strasse",
                confidence: 0.15,
              },
            ],
          },
          range: {
            start: 61,
            end: 81,
          },
        },
      ];
    case "132|Hausnummer":
      return [
        {
          entity: JSON.stringify({
            name: "132",
            type: "Hausnummer",
            canonicalId: "housenumber:132",
            addressContext: {
              streetCanonicalId: "street:leipzig:karl-liebknecht-strasse",
              city: "Leipzig",
              postalCode: "04277",
              country: "Deutschland",
            },
          }),
          disambiguation: {
            status: "resolved",
            confidence: 0.95,
          },
          range: {
            start: 87,
            end: 90,
          },
        },
      ];
    case "04277|Postleitzahl":
      return [
        {
          entity: JSON.stringify({
            name: "04277",
            type: "Postleitzahl",
            canonicalId: "postalcode:04277",
            city: "Leipzig",
            state: "Sachsen",
            country: "Deutschland",
          }),
          disambiguation: {
            status: "resolved",
            confidence: 0.99,
          },
          range: {
            start: 72,
            end: 77,
          },
        },
      ];
    case "heute|Datum":
      return [
        {
          entity: JSON.stringify({
            name: "heute",
            type: "Datum",
            resolvedDate: "2026-02-04",
            granularity: "day",
            timezone: "Europe/Berlin",
            canonicalId: "date:2026-02-04",
          }),
          disambiguation: {
            status: "resolved",
            method: "relative-date-resolution",
            confidence: 1.0,
          },
          range: {
            start: 86,
            end: 91,
          },
        },
      ];
    default:
      console.warn("Unrecognized entity:", entity);
      return [];
  }
};
