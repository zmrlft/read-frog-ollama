import { createProviderRegistry } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export async function getProviderRegistry() {
  const openaiApiKey = await storage.getItem<string>(`local:openaiApiKey`);

  return createProviderRegistry({
    openai: createOpenAI({
      apiKey: openaiApiKey || undefined,
    }),
  });
}
