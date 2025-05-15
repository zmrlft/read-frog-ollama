import { generateText } from "ai";

import { langCodeToEnglishName } from "@/types/config/languages";

import { globalConfig } from "../config/config";
import { getTranslateLinePrompt } from "../prompts/translate-line";

export async function translateText(sourceText: string) {
  if (!globalConfig) {
    throw new Error("No global config when translate text");
  }
  const registry = await getProviderRegistry();
  const provider = globalConfig.provider;
  const model = globalConfig.providersConfig[provider].model;

  // TODO: retry logic + cache logic
  const { text } = await generateText({
    model: registry.languageModel(`${provider}:${model}`),
    prompt: getTranslateLinePrompt(
      langCodeToEnglishName[globalConfig.language.targetCode],
      sourceText,
    ),
  });

  // LLM models can't return empty text, so we need to return empty string if the translation is the same as the source text
  return text === sourceText ? "" : text;
}
