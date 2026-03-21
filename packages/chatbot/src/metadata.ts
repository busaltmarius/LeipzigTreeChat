export type ChatBotMetadataStatus =
  | "WAITING_FOR_INPUT"
  | "REWRITING_QUESTION"
  | "GATHERING_DATA"
  | "GENERATING_CLARIFICATION"
  | "GENERATING_RESPONSE"
  | "ERROR";

export type ChatBotMetadataEvent = {
  status: ChatBotMetadataStatus;
  message: string;
  terminal?: boolean;
};

export type ChatBotMetadataCallback = (event: ChatBotMetadataEvent) => Promise<void> | void;

export const CHATBOT_METADATA_MESSAGES: Record<ChatBotMetadataStatus, string> = {
  WAITING_FOR_INPUT: "Bereit fuer deine naechste Frage.",
  REWRITING_QUESTION: "Ich formuliere die Anfrage praeziser.",
  GATHERING_DATA: "Ich sammle passende Daten aus dem Wissensbestand.",
  GENERATING_CLARIFICATION: "Ich bereite eine Rueckfrage vor.",
  GENERATING_RESPONSE: "Ich formuliere die Antwort.",
  ERROR: "Es ist ein Fehler bei der Verarbeitung aufgetreten.",
};

export const createChatBotMetadataEvent = (
  status: ChatBotMetadataStatus,
  overrides: Partial<Omit<ChatBotMetadataEvent, "status">> = {}
): ChatBotMetadataEvent => ({
  status,
  message: overrides.message ?? CHATBOT_METADATA_MESSAGES[status],
  terminal: overrides.terminal,
});
