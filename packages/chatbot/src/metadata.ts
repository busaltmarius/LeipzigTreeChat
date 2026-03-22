import type { ReadonlyRecord } from "effect/Record";

/**
 * Progress states emitted while the chatbot graph processes a request.
 */
export type ChatBotMetadataStatus =
  | "WAITING_FOR_INPUT"
  | "REWRITING_QUESTION"
  | "GATHERING_DATA"
  | "GENERATING_CLARIFICATION"
  | "GENERATING_RESPONSE"
  | "ERROR";

/**
 * Metadata event forwarded to UI integrations so they can reflect chatbot progress.
 */
export type ChatBotMetadataEvent = {
  /**
   * Current processing step within the chatbot pipeline.
   */
  status: ChatBotMetadataStatus;
  /**
   * Optional user-facing detail for the current step, mainly used for errors.
   */
  message?: string;
};

/**
 * Callback invoked whenever the chatbot emits a metadata event.
 */
export type ChatBotMetadataCallback = (event: ChatBotMetadataEvent) => Promise<void> | void;

/**
 * Default user-facing messages for each metadata status.
 */
export const CHATBOT_METADATA_MESSAGES: ReadonlyRecord<ChatBotMetadataStatus, string> = {
  WAITING_FOR_INPUT: "Bereit für deine nächste Frage.",
  REWRITING_QUESTION: "Ich formuliere die Anfrage präziser.",
  GATHERING_DATA: "Ich sammle passende Daten aus dem Wissensbestand.",
  GENERATING_CLARIFICATION: "Ich bereite eine Rückfrage vor.",
  GENERATING_RESPONSE: "Ich formuliere die Antwort.",
  ERROR: "Ein Fehler ist aufgetreten.",
} as const;
