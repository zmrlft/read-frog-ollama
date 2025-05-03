import OpenAI from "openai";
import { createProviderRegistry } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export async function getOpenAIClient() {
  const openaiApiKey = await storage.getItem<string>(`local:openaiApiKey`);

  return new OpenAI({
    apiKey: openaiApiKey || undefined,
    dangerouslyAllowBrowser: true,
  });
}

export async function getProviderRegistry() {
  const openaiApiKey = await storage.getItem<string>(`local:openaiApiKey`);

  return createProviderRegistry({
    openai: createOpenAI({
      apiKey: openaiApiKey || undefined,
    }),
  });
}
