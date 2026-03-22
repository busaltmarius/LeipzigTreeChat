import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

import { Config, ConfigProvider, Context, Data, Effect, Layer, Redacted } from "effect";
import { CHATBOT_PERSONA } from "./constants.js";
import { QanaryClarificationQuestion, QanaryFinalAnswer } from "./state/qanary-types.js";

globalThis.AI_SDK_LOG_WARNINGS = false;

export type OpenRouterClient = ReturnType<typeof createOpenRouter>;

export class LLMServiceError extends Data.TaggedError("LLMServiceError")<{
  readonly operation: string;
  readonly reason: unknown;
}> {
  constructor(operation: string, reason: unknown) {
    super({ operation, reason });
  }
}

export class OpenRouter extends Context.Tag("OpenRouter")<
  OpenRouter,
  {
    readonly client: () => Effect.Effect<OpenRouterClient, never, never>;
  }
>() {
  static Live = Layer.effect(
    this,
    Effect.withConfigProvider(
      Effect.gen(function* () {
        const apiKey = yield* Config.redacted("OPENROUTER_API_KEY");
        const openrouterClient = createOpenRouter({
          apiKey: Redacted.value(apiKey),
        });
        return {
          client: () => Effect.succeed(openrouterClient),
        };
      }),
      ConfigProvider.fromEnv()
    )
  );
}

type LLMServiceInterface = {
  /**
   * Asks the LLM a question and returns the response.
   * @param userInput The question to ask the LLM.
   * @returns The LLM's response as string.
   */
  readonly ask: (userInput: string) => Effect.Effect<string, LLMServiceError, never>;
  /**
   * Generates a chatbot response based on user input and provided data.
   * @param userInput The original input/question from the user.
   * @param qanaryAnswer The data to assist in generating the response.
   * @returns The generated chatbot response as string.
   */
  readonly generateChatbotResponse: (
    userInput: string,
    qanaryAnswer: QanaryFinalAnswer
  ) => Effect.Effect<string, LLMServiceError, never>;
  /**
   * Generates a chatbot clarification question based on user input and provided data.
   * @param userInput The original input/question from the user.
   * @param data The data to assist in generating the clarification question.
   * @returns The generated chatbot clarification question as string.
   */
  readonly generateClarificationQuestion: (
    userInput: string,
    qanaryClarificationQuestion: QanaryClarificationQuestion
  ) => Effect.Effect<string, LLMServiceError, never>;
  /**
   * Rewrites a question by consolidating conversation history with new input.
   * Combines known information from previous messages with new input into a single comprehensive question.
   * @param conversationHistory The previous messages in the conversation.
   * @param newInput The new user input to be combined.
   * @returns The rewritten question as a string.
   */
  readonly rewriteQuestion: (
    conversationHistory: string | undefined,
    newInput: string
  ) => Effect.Effect<string, LLMServiceError, never>;
};

export class LLMService extends Context.Tag("LLMService")<LLMService, LLMServiceInterface>() {
  static Live = Layer.effect(
    LLMService,
    Effect.gen(function* () {
      const openrouter = yield* OpenRouter;
      const openrouterClient = yield* openrouter.client();
      const deepseek_v3_2 = openrouterClient.chat("deepseek/deepseek-v3.2");
      const generateTextEffect = (
        operation: string,
        messages: NonNullable<Parameters<typeof generateText>[0]["messages"]>
      ) =>
        Effect.tryPromise({
          try: () =>
            generateText({
              model: deepseek_v3_2,
              messages,
            }),
          catch: (reason: unknown) => new LLMServiceError(operation, reason),
        });

      return {
        ask: (userInput: string) =>
          Effect.gen(function* () {
            const { text } = yield* generateTextEffect("ask", [{ role: "user", content: userInput }]);

            return text;
          }),
        generateChatbotResponse: (userInput, qanaryAnswer) =>
          Effect.gen(function* () {
            const { text } = yield* generateTextEffect("generateChatbotResponse", [
              {
                role: "system",
                content: [
                  CHATBOT_PERSONA,
                  "\n",
                  "Beantworte die Frage des Benutzers mithilfe der bereitgestellten Daten! ",
                  "Die Daten findest du als JSON-Format in der Nachricht mitangehängt.",
                  "Nimm die angehaengten Daten als wahr an und hinterfrage diese nicht.",
                  "Du MUSST die Daten zwingend in deine Antwort einbeziehen, auch wenn diese Koordinaten sind, ",
                  "Bau diese mit ein und bewerte NICHT, ob diese die Antwort sein könnten.",
                ].join(""),
              },
              {
                role: "user",
                content: [
                  "## Frage des Benutzers:",
                  "\n",
                  userInput,
                  "## Bereitgestellte Daten:",
                  "\n",
                  qanaryAnswer.content,
                ].join(""),
              },
            ]);

            return text;
          }),
        generateClarificationQuestion: (userInput, qanaryClarificationQuestion) =>
          Effect.gen(function* () {
            const { text } = yield* generateTextEffect("generateClarificationQuestion", [
              {
                role: "system",
                content: [
                  CHATBOT_PERSONA,
                  "\n",
                  "Erstelle eine prägnante, präzise Frage, die den Benutzer um zusätzliche Informationen verlangt. ",
                  "Du findest bereitgestellte Daten als JSON vor, welche die noch offenen Punkte definieren.",
                  "\n",
                  "Nimm die angehängten Daten als wahr an und hinterfrage diese nicht. ",
                  "Du MUSST die Daten zwingend in deine Antwort einbeziehen. ",
                  "Bau diese mit ein und bewerte NICHT, ob diese die Antwort sein könnten. ",
                ].join(""),
              },
              {
                role: "user",
                content: [
                  "## Frage des Benutzers:",
                  "\n",
                  userInput,
                  "## Bereitgestellte Daten:",
                  "\n",
                  qanaryClarificationQuestion.content,
                ].join(""),
              },
            ]);

            return text;
          }),
        rewriteQuestion: (conversationHistory, newInput) =>
          Effect.gen(function* () {
            const { text } = yield* generateTextEffect("rewriteQuestion", [
              {
                role: "system",
                content: [
                  "Du bist ein Assistent, der Fragen kombiniert und konsolidiert. ",
                  "Kombiniere die Gesprächshistorie mit der neuen Eingabe zu EINER umfassenden Frage. ",
                  "Diese Frage sollte alle bekannten Informationen aus dem Gesprächsverlauf und alle neuen Informationen enthalten. ",
                  "Die resultierende Frage sollte präzise, vollständig und selbsterklärend sein. ",
                  "Antworte NUR mit der rewritten Frage, ohne weitere Erklärungen.",
                ].join(""),
              },
              {
                role: "user",
                content: [
                  "## Gesprächshistorie:",
                  "\n",
                  conversationHistory || "(Keine vorherige Gesprächshistorie)",
                  "\n\n",
                  "## Neue Eingabe:",
                  "\n",
                  newInput,
                  "\n\n",
                  "Kombiniere diese zu EINER umfassenden Frage:",
                ].join(""),
              },
            ]);

            return text;
          }),
      };
    })
  );
}
