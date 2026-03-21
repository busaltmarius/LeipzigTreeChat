import { ReadonlyRecord } from "effect/Record";

export type ChatBotMetadataStatus =
  | "WAITING_FOR_INPUT"
  | "REWRITING_QUESTION"
  | "GATHERING_DATA"
  | "GENERATING_CLARIFICATION"
  | "GENERATING_RESPONSE"
  | "ERROR";

export type ChatBotMetadataEvent = {
  status: ChatBotMetadataStatus;
};

export type ChatBotMetadataCallback = (event: ChatBotMetadataEvent) => Promise<void> | void;

export const CHATBOT_METADATA_MESSAGES: ReadonlyRecord<ChatBotMetadataStatus, string> = {
  WAITING_FOR_INPUT: "Bereit für deine nächste Frage.",
  REWRITING_QUESTION: "Ich formuliere die Anfrage präziser.",
  GATHERING_DATA: "Ich sammle passende Daten aus dem Wissensbestand.",
  GENERATING_CLARIFICATION: "Ich bereite eine Rückfrage vor.",
  GENERATING_RESPONSE: "Ich formuliere die Antwort.",
  ERROR: "Ein Fehler ist aufgetreten.",
} as const;
