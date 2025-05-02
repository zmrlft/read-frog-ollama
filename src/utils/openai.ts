import OpenAI from "openai";
import { APP_PREFIX } from "./constants/app";

export async function getOpenAIClient() {
  const openaiApiKey = await storage.getItem<string>(
    `local:${APP_PREFIX}_openaiApiKey`
  );

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
