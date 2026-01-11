let _config = new Map<string, string>();

export type ChatbotConfig = {
  OPENROUTER_API_KEY: string;
};

export function setConfig(config: ChatbotConfig) {
  _config = new Map(Object.entries(config));
}

export function getConfig(): ChatbotConfig {
  return {
    OPENROUTER_API_KEY: _config.get("OPENROUTER_API_KEY") || "",
  };
}
