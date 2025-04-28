import OpenAI from "openai";

export async function getOpenAIClient() {
  const openaiApiKey = await storage.getItem<string>(
    "local:readBuddy_openaiApiKey"
  );

  console.log("dev mode", import.meta.env.DEV);
  console.log("openaiApiKey", import.meta.env.WXT_OPENAI_API_KEY);

  // if in dev mode, get api key from .env
  if (import.meta.env.DEV && !openaiApiKey) {
    console.log("dev mode, getting api key from .env");
    return new OpenAI({
      apiKey: import.meta.env.WXT_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  return new OpenAI({
    apiKey: openaiApiKey || undefined,
    dangerouslyAllowBrowser: true,
  });
}
