import { langCodeToEnglishName } from "@/types/config/languages";
import { generateText } from "ai";
import { getTranslateLinePrompt } from "../prompts/translate-line";
import { BLOCK_TAGS, INLINE_TRANSLATE_TAGS } from "../constants/dom";

export function handleShowOrHideTranslationAction(
  mouseX: number,
  mouseY: number
) {
  if (!globalConfig) return;

  const node = selectNode(mouseX, mouseY);

  if (!node || !(node instanceof HTMLElement) || !shouldTriggerAction(node))
    return;

  let translatedWrapperNode = node.querySelector(".notranslate");

  if (translatedWrapperNode) {
    translatedWrapperNode.remove();
  } else {
    translatedWrapperNode = document.createElement("span");
    translatedWrapperNode.className =
      "notranslate read-frog-translated-content-wrapper";

    const translatedNode = document.createElement("span");

    if (INLINE_TRANSLATE_TAGS.has(node.tagName)) {
      const spaceNode = document.createElement("span");
      spaceNode.innerHTML = "&nbsp;&nbsp;";
      translatedWrapperNode.appendChild(spaceNode);
      translatedNode.className =
        "notranslate read-frog-translated-inline-content";
    } else {
      const brNode = document.createElement("br");
      translatedWrapperNode.appendChild(brNode);
      translatedNode.className =
        "notranslate read-frog-translated-block-content";
    }

    translatedNode.textContent = "Translated content!";
    translatedWrapperNode.appendChild(translatedNode);
    node.appendChild(translatedWrapperNode);
  }
}

function deepElementFromPoint(
  root: Document | ShadowRoot,
  x: number,
  y: number
) {
  // 第一步：在当前 root（Document 或 ShadowRoot）里拿第一级命中
  const el = root.elementFromPoint(x, y);
  // 如果这个元素有 open shadowRoot，继续在它的 shadowRoot 里查
  if (el && el.shadowRoot) {
    return deepElementFromPoint(el.shadowRoot, x, y);
  }
  // 否则，el 就是我们想要的最深层元素
  return el;
}

function selectNode(mouseX: number, mouseY: number) {
  // 1. if not block node, find up to the block node
  let currentNode = deepElementFromPoint(document, mouseX, mouseY);

  while (
    currentNode &&
    (window.getComputedStyle(currentNode).display.includes("inline") ||
      currentNode.className.includes("notranslate"))
  ) {
    currentNode = currentNode.parentElement;
  }
  // while currentNode only has one children, and no text node, choose the children
  while (
    currentNode &&
    currentNode.childNodes.length === 1 &&
    currentNode.children.length === 1
  ) {
    currentNode = currentNode.children[0];
  }

  return currentNode;
}

function shouldTriggerAction(node: Node) {
  return node.textContent?.trim();
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
