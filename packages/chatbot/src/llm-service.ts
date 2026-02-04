import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

import { Config, ConfigProvider, Context, Effect, Layer, Redacted } from "effect";
import { CHATBOT_PERSONA } from "./constants.js";

export type OpenRouterClient = ReturnType<typeof createOpenRouter>;

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
      ConfigProvider.fromEnv(),
    )
  );
}

type LLMServiceInterface = {
  /**
   * Asks the LLM a question and returns the response.
   * @param userInput The question to ask the LLM.
   * @returns The LLM's response as string.
   */
  readonly ask: (userInput: string) => Effect.Effect<string, never, never>;
  /**
   * Generates a chatbot response based on user input and provided data.
   * @param userInput The original input/question from the user.
   * @param data The data to assist in generating the response.
   * @returns The generated chatbot response as string.
   */
  readonly generateChatbotResponse: (userInput: string, data: any) => Effect.Effect<string, never, never>;
};

export class LLMService extends Context.Tag("LLMService")<LLMService, LLMServiceInterface>() {
  static Live = Layer.effect(
    LLMService,
    Effect.gen(function* () {
      const openrouter = yield* OpenRouter;
      const openrouterClient = yield* openrouter.client();

      return {
        ask: (userInput: string) =>
          Effect.gen(function* () {
            const deepseek_v3_2 = openrouterClient.chat("deepseek/deepseek-v3.2");
            const { text } = yield* Effect.promise(() =>
              generateText({
                model: deepseek_v3_2,
                messages: [{ role: "user", content: userInput }],
              })
            );

            return text;
          }),
        generateChatbotResponse: (userInput: string, data: any) =>
          Effect.gen(function* () {
            const deepseek_v3_2 = openrouterClient.chat("deepseek/deepseek-v3.2");
            const { text } = yield* Effect.promise(() =>
              generateText({
                model: deepseek_v3_2,
                messages: [
                  {
                    role: "system",
                    content: [
                      CHATBOT_PERSONA,
                      "\n",
                      "Beantworte die Frage des Benutzers mithilfe der bereitgestellten Daten! ",
                      "Die Daten findest du als JSON-Format in der Nachricht mitangehängt.",
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
                      JSON.stringify(data),
                    ].join(""),
                  },
                ],
              })
            );

            return text;
          }),
      };
    })
  );
}
