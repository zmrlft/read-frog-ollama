import { generateText } from "ai";

import { langCodeToEnglishName } from "@/types/config/languages";
import { TransNode } from "@/types/dom";

import { FORCE_INLINE_TRANSLATION_TAGS } from "../constants/dom";
import { getTranslateLinePrompt } from "../prompts/translate-line";
import { isInlineTransNode } from "./dom/filter";
import {
  extractTextContent,
  translateWalkedElement,
  unwrapDeepestOnlyChild,
  walkAndLabelElement,
} from "./dom/traversal";

const translatingNodes = new Set<HTMLElement | Text>();

// export function handleShowOrHideTranslationAction(
//   mouseX: number,
//   mouseY: number,
// ) {
//   if (!globalConfig) return;

//   const node = findNearestBlockNodeAtPoint(mouseX, mouseY);

//   if (!node || !(node instanceof HTMLElement) || !shouldTriggerAction(node))
//     return;

//   const translatedWrapperNode = node.querySelector(".notranslate");

//   if (translatedWrapperNode) {
//     translatedWrapperNode.remove();
//   } else {
//     // prevent too quick hotkey trigger
//     if (translatingNodes.has(node)) return;
//     translatingNodes.add(node);
//     translateNode(node);
//   }
// }

// function shouldTriggerAction(node: Node) {
//   return node.textContent?.trim();
// }

export async function translatePage() {
  const id = crypto.randomUUID();

  walkAndLabelElement(document.body, id);
  translateWalkedElement(document.body);
}

export async function translateNode(node: TransNode) {
  try {
    const targetNode =
      node instanceof HTMLElement ? unwrapDeepestOnlyChild(node) : node;

    const textContent = extractTextContent(targetNode);
    if (!textContent) return;

    const spinner = document.createElement("span");
    spinner.className = "read-frog-spinner";
    if (targetNode instanceof HTMLElement) {
      targetNode.appendChild(spinner);
    } else if (targetNode instanceof Text) {
      targetNode.parentNode?.insertBefore(spinner, targetNode.nextSibling);
    }
    const translatedText = await translateText(textContent);
    spinner.remove();

    if (!translatedText) return;

    const translatedWrapperNode = createTranslatedWrapperNode(
      targetNode,
      translatedText,
    );

    if (targetNode instanceof HTMLElement) {
      targetNode.appendChild(translatedWrapperNode);
    } else if (targetNode instanceof Text) {
      targetNode.parentNode?.insertBefore(
        translatedWrapperNode,
        targetNode.nextSibling,
      );
    }
  } catch (error) {
    logger.error(error);
  } finally {
    translatingNodes.delete(node);
  }
}

function createTranslatedWrapperNode(
  targetNode: TransNode,
  translatedText: string,
) {
  const translatedWrapperNode = document.createElement("span");
  translatedWrapperNode.className =
    "notranslate read-frog-translated-content-wrapper";

  const translatedNode = document.createElement("span");
  const isForceInlineTranslationElement =
    targetNode instanceof HTMLElement &&
    FORCE_INLINE_TRANSLATION_TAGS.has(targetNode.tagName);
  if (translatedText === "开始" || translatedText === "开始使用") {
    console.log(targetNode);
    console.log(isForceInlineTranslationElement);
    console.log(isInlineTransNode(targetNode));
  }
  if (isForceInlineTranslationElement || isInlineTransNode(targetNode)) {
    const spaceNode = document.createElement("span");
    spaceNode.innerHTML = "&nbsp;&nbsp;";
    translatedWrapperNode.appendChild(spaceNode);
    translatedNode.className =
      "notranslate read-frog-translated-inline-content";
  } else {
    const brNode = document.createElement("br");
    translatedWrapperNode.appendChild(brNode);
    translatedNode.className = "notranslate read-frog-translated-block-content";
  }

  translatedNode.textContent = translatedText;
  translatedWrapperNode.appendChild(translatedNode);

  return translatedWrapperNode;
}

async function translateText(sourceText: string) {
  if (!globalConfig) return;
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
