import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

import { Config, ConfigProvider, Context, Effect, Layer, Redacted } from "effect";

import { ASSISTANT_DOCSTRING } from "./constants.js";
import { getConfig } from "./config.js";

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
      ConfigProvider.fromJson(getConfig())
    )
  );
}

export class LLMService extends Context.Tag("LLMService")<
  LLMService,
  {
    readonly ask: (userInput: string) => Effect.Effect<string, never, never>;
  }
>() {
  static Live = Layer.effect(
    LLMService,
    Effect.gen(function* () {
      const openrouter = yield* OpenRouter;
      const openrouterClient = yield* openrouter.client();

      return {
        ask: (userInput: string) => Effect.promise(() => ask(openrouterClient, userInput)),
      };
    })
  );
}

async function ask(openrouterClient: OpenRouterClient, user_input: string) {
  const deepseek_v3_2 = openrouterClient.chat("deepseek/deepseek-v3.2-speciale");
  const { text } = await generateText({
    model: deepseek_v3_2,
    messages: [
      {
        role: "system",
        content: [
          "You are a Named Entity Recognition Tool. ",
          "Recognize named entities and output the structured data as a JSON. \n",
          "**Output ONLY the structured data.**",
          "Below is a text for you to analyze.",
        ].join(""),
      },
      {
        role: "user",
        content: "My address is Gustav-Freytag Straße 12A in Leipzig.",
      },
      { role: "assistant", content: ASSISTANT_DOCSTRING },
      { role: "user", content: user_input },
    ],
  });

  return text;
}
