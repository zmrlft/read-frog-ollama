import { createProviderRegistry } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { Provider, ProviderConfig } from "@/types/provider";
import openaiLogo from "@/assets/llm/openai.jpg";
import deepseekLogo from "@/assets/llm/deepseek.png";

export const defaultProviderConfig: ProviderConfig = {
  openai: { apiKey: undefined, model: "gpt-4.1-mini", isCustomModel: false },
  deepseek: { apiKey: undefined, model: "deepseek-chat", isCustomModel: false },
};

export const providerItems: Record<Provider, { logo: string; name: string }> = {
  openai: {
    logo: openaiLogo,
    name: "OpenAI",
  },
  deepseek: {
    logo: deepseekLogo,
    name: "DeepSeek",
  },
};

export async function getProviderRegistry() {
  const providerConfig = await storage.getItem<ProviderConfig>(
    `local:providerConfig`
  );

  return createProviderRegistry({
    openai: createOpenAI({
      apiKey: providerConfig?.openai.apiKey,
    }),
    deepseek: createDeepSeek({
      apiKey: providerConfig?.deepseek.apiKey,
    }),
  });
}
