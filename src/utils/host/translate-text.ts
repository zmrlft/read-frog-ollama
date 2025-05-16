import { generateText } from "ai";

import { langCodeToEnglishName } from "@/types/config/languages";

import { globalConfig } from "../config/config";
import { logger } from "../logger";
import { getTranslateLinePrompt } from "../prompts/translate-line";

export async function translateText(sourceText: string) {
  if (!globalConfig) {
    throw new Error("No global config when translate text");
  }
  const registry = await getProviderRegistry();
  const provider = globalConfig.provider;
  const model = globalConfig.providersConfig[provider].model;

  // replace /\u200B/g is for Feishu, it's a zero-width space
  const cleanSourceText = sourceText.replace(/\u200B/g, "").trim();

  // TODO: retry logic + cache logic
  const { text } = await generateText({
    model: registry.languageModel(`${provider}:${model}`),
    prompt: getTranslateLinePrompt(
      langCodeToEnglishName[globalConfig.language.targetCode],
      cleanSourceText,
    ),
  });

  if (cleanSourceText.includes("介绍")) {
    logger.warn(
      "sourceText",
      sourceText,
      cleanSourceText,
      text === cleanSourceText,
    );
  }
  // Compare cleaned versions to determine if translation is the same
  return cleanSourceText === text ? "" : text;
}
