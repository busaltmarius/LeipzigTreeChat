import type { IQanaryComponentMessageHandler } from "@leipzigtreechat/qanary-component-core";
import {
  createAnnotationInKnowledgeGraph,
  type IAnnotationInformation,
} from "@leipzigtreechat/qanary-component-helpers";
import { getQuestion, type IQanaryMessage, QANARY_PREFIX } from "@leipzigtreechat/shared";

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

  const nerdAnnotations: Array<IAnnotationInformation> = await getNerdAnnotations(question);
  console.log(`NED/NER for question '${question}':`, nerdAnnotations);

  for (const annotation of nerdAnnotations) {
    await createAnnotationInKnowledgeGraph({
      message: message,
      componentName: "qanary-component-nerd-simple",
      annotation,
      annotationType: `${QANARY_PREFIX}AnnotationOfNerd`,
    });
  }

  return message;
};

const getNerdAnnotations = async (question: string): Promise<Array<IAnnotationInformation>> => {
  switch (question) {
    case "Wie viel wurde im Stadtteil Connewitz gegossen?":
      return [
        {
          value: JSON.stringify({
            entity: "Connewitz",
            type: "Stadtteil",
          }),
          range: { start: 28, end: 37 },
          confidence: 1,
        },
      ];
    case "Welche Wasserentnahmestellen gibt es in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig?":
      return [
        {
          value: JSON.stringify({
            entity: "Karl-Liebknecht-Str.",
            type: "Straße",
          }),
          range: { start: 61, end: 81 },
          confidence: 1,
        },
        {
          value: JSON.stringify({
            entity: "132",
            type: "Hausnummer",
          }),
          range: { start: 82, end: 85 },
          confidence: 1,
        },
        {
          value: JSON.stringify({
            entity: "04277",
            type: "Postleitzahl",
          }),
          range: { start: 87, end: 92 },
          confidence: 1,
        },
        {
          value: JSON.stringify({
            entity: "Leipzig",
            type: "Stadt",
          }),
          range: { start: 93, end: 100 },
          confidence: 1,
        },
      ];
    case "Welchen Baum kann ich in der Nähe der Adresse Karl-Liebknecht-Str. 132, 04277 Leipzig heute gießen?":
      return [
        {
          value: JSON.stringify({
            entity: "Karl-Liebknecht-Str.",
            type: "Straße",
          }),
          range: { start: 46, end: 66 },
          confidence: 1,
        },
        {
          value: JSON.stringify({
            entity: "132",
            type: "Hausnummer",
          }),
          range: { start: 87, end: 90 },
          confidence: 1,
        },
        {
          value: JSON.stringify({
            entity: "04277",
            type: "Postleitzahl",
          }),
          range: { start: 72, end: 77 },
          confidence: 1,
        },
        {
          value: JSON.stringify({
            entity: "Leipzig",
            type: "Stadt",
          }),
          range: { start: 78, end: 85 },
          confidence: 1,
        },
        {
          value: JSON.stringify({
            entity: "heute",
            type: "Datum",
          }),
          range: { start: 86, end: 91 },
          confidence: 1,
        },
      ];
    case "Was kannst du mir über die Bäume in Leipzig erklären?":
      return [
        {
          value: JSON.stringify({
            entity: "Leipzig",
            type: "Stadt",
          }),
          range: { start: 36, end: 43 },
          confidence: 1,
        },
      ];
    default:
      console.warn("Unrecognized question:", question);
      return [];
  }
};
