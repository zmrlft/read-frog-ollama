import { generateText } from "ai";

import { langCodeToEnglishName } from "@/types/config/languages";
import { Point, TransNode } from "@/types/dom";

import { FORCE_INLINE_TRANSLATION_TAGS } from "../constants/dom";
import { getTranslateLinePrompt } from "../prompts/translate-line";
import { isBlockTransNode, isInlineTransNode } from "./dom/filter";
import {
  extractTextContent,
  findNearestBlockNodeAt,
  translateWalkedElement,
  unwrapDeepestOnlyChild,
  walkAndLabelElement,
} from "./dom/traversal";

const translatingNodes = new Set<HTMLElement | Text>();

export function hideOrShowManualTranslation(point: Point) {
  if (!globalConfig) return;

  const node = findNearestBlockNodeAt(point);

  if (!node || !(node instanceof HTMLElement) || !shouldTriggerAction(node))
    return;

  const id = crypto.randomUUID();
  walkAndLabelElement(node, id);
  translateWalkedElement(node, id, true);
}

function shouldTriggerAction(node: Node) {
  return node.textContent?.trim();
}

export async function translatePage() {
  const id = crypto.randomUUID();

  walkAndLabelElement(document.body, id);
  translateWalkedElement(document.body, id);
}

export function removeAllTranslatedWrapperNodes(
  root: Document | ShadowRoot = document,
) {
  function removeFromRoot(root: Document | ShadowRoot) {
    const translatedNodes = root.querySelectorAll(
      ".notranslate.read-frog-translated-content-wrapper",
    );
    translatedNodes.forEach((node) => node.remove());

    // Recursively search through shadow roots
    root.querySelectorAll("*").forEach((element) => {
      if (element instanceof HTMLElement && element.shadowRoot) {
        removeFromRoot(element.shadowRoot);
      }
    });
  }

  removeFromRoot(root);
}

/**
 * Translate the node
 * @param node - The node to translate
 * @param toggle - Whether to toggle the translation, if true, the translation will be removed if it already exists
 */
export async function translateNode(node: TransNode, toggle: boolean = false) {
  try {
    // prevent duplicate translation
    if (translatingNodes.has(node)) return;
    translatingNodes.add(node);

    const targetNode =
      node instanceof HTMLElement ? unwrapDeepestOnlyChild(node) : node;

    const existedTranslatedWrapper = findExistedTranslatedWrapper(targetNode);
    if (existedTranslatedWrapper) {
      if (toggle) {
        existedTranslatedWrapper.remove();
      }
      return;
    }

    const textContent = extractTextContent(targetNode);
    if (!textContent) return;

    const translatedWrapperNode = document.createElement("span");
    translatedWrapperNode.className =
      "notranslate read-frog-translated-content-wrapper";
    const spinner = document.createElement("span");
    spinner.className = "read-frog-spinner";
    translatedWrapperNode.appendChild(spinner);
    if (targetNode instanceof HTMLElement) {
      targetNode.appendChild(translatedWrapperNode);
    } else if (targetNode instanceof Text) {
      targetNode.parentNode?.insertBefore(
        translatedWrapperNode,
        targetNode.nextSibling,
      );
    }

    let translatedText: string | undefined;
    try {
      translatedText = await translateText(textContent);
    } catch (error) {
      translatedWrapperNode.remove();
      logger.error(error);
    } finally {
      spinner.remove();
    }

    if (!translatedText) return;

    insertTranslatedNodeIntoWrapper(
      translatedWrapperNode,
      targetNode,
      translatedText,
    );
  } catch (error) {
    logger.error(error);
  } finally {
    translatingNodes.delete(node);
  }
}

function findExistedTranslatedWrapper(node: TransNode) {
  if (node instanceof Text) {
    if (
      node.nextSibling instanceof HTMLElement &&
      node.nextSibling.classList.contains("notranslate")
    ) {
      return node.nextSibling;
    }
  } else if (node instanceof HTMLElement) {
    return node.querySelector(":scope > .notranslate");
  }
  return null;
}

function insertTranslatedNodeIntoWrapper(
  translatedWrapperNode: HTMLElement,
  targetNode: TransNode,
  translatedText: string,
) {
  const translatedNode = document.createElement("span");
  const isForceInlineTranslationElement =
    targetNode instanceof HTMLElement &&
    FORCE_INLINE_TRANSLATION_TAGS.has(targetNode.tagName);

  if (isForceInlineTranslationElement || isInlineTransNode(targetNode)) {
    const spaceNode = document.createElement("span");
    spaceNode.innerHTML = "&nbsp;&nbsp;";
    translatedWrapperNode.appendChild(spaceNode);
    translatedNode.className =
      "notranslate read-frog-translated-inline-content";
  } else if (isBlockTransNode(targetNode)) {
    const brNode = document.createElement("br");
    translatedWrapperNode.appendChild(brNode);
    translatedNode.className = "notranslate read-frog-translated-block-content";
  } else {
    // not inline or block, maybe notranslate
    return null;
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
