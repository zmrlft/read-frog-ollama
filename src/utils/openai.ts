import OpenAI from "openai";

export async function getOpenAIClient() {
  const openaiApiKey = await storage.getItem<string>(`local:openaiApiKey`);

  return new OpenAI({
    apiKey: openaiApiKey || undefined,
    dangerouslyAllowBrowser: true,
  });
}
