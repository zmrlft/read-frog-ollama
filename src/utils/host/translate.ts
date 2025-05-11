import { langCodeToEnglishName } from "@/types/config/languages";
import { generateText } from "ai";
import { getTranslateLinePrompt } from "../prompts/translate-line";

const translatingNode: Set<Node> = new Set();

export function handleTranslate(mouseX: number, mouseY: number) {
  if (!globalConfig) return;

  const node = selectNode(mouseX, mouseY);
  if (!node || !shouldTranslate(node)) return;

  translatingNode.add(node);
  translateNode(node);
}

function selectNode(mouseX: number, mouseY: number) {
  // 1. if not block node, find up to the block node
  return document.elementFromPoint(mouseX, mouseY);
}

function shouldTranslate(node: Node) {
  return node.textContent?.trim() && !translatingNode.has(node);
}

async function translateNode(node: Node) {
  if (!globalConfig) return;
  const registry = await getProviderRegistry();
  const provider = globalConfig.provider;
  const model = globalConfig.providersConfig[provider].model;

  if (!node.textContent) return;

  const { text } = await generateText({
    model: registry.languageModel(`${provider}:${model}`),
    prompt: getTranslateLinePrompt(
      langCodeToEnglishName[globalConfig.language.targetCode],
      node.textContent
    ),
  });

  console.log("translated", text);
}
