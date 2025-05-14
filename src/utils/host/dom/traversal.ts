import { Point, TransNode } from "@/types/dom";
import { INVALID_TRANSLATE_TAGS } from "@/utils/constants/dom";

import { translateNode } from "../translate";
import { isBlockTransNode, isInlineHTMLElement } from "./filter";
import { smashTruncationStyle } from "./style";

/**
 * Find the element at the given point even inside shadow roots
 * @param root - The root element (Document or ShadowRoot)
 * @param point - The point to find the element
 */
export function findElementAt(root: Document | ShadowRoot, point: Point) {
  const { x, y } = point;
  const element = root.elementFromPoint(x, y);
  if (element && element.shadowRoot) {
    return findElementAt(element.shadowRoot, point);
  }
  return element;
}

/**
 * Find the nearest block node from the point
 * @param point - The point to find the nearest block node
 */
export function findNearestBlockNodeAt(point: Point) {
  let currentNode = findElementAt(document, point);

  // TODO: support SVGElement in the future
  while (
    currentNode instanceof HTMLElement &&
    isInlineHTMLElement(currentNode)
  ) {
    currentNode = currentNode.parentElement;
  }

  return currentNode;
}

export function extractTextContent(node: TransNode): string {
  if (node instanceof Text) {
    return node.textContent ?? "";
  }

  if (node.classList.contains("sr-only")) {
    return "";
  }

  const childNodes = Array.from(node.childNodes);
  return childNodes.reduce((text: string, child: Node): string => {
    // TODO: support SVGElement in the future
    if (child instanceof Text || child instanceof HTMLElement) {
      return text + extractTextContent(child);
    }
    return text;
  }, "");
}

export function walkAndLabelElement(element: HTMLElement, walkId: string) {
  if (element.classList.contains("notranslate")) {
    return;
  }

  element.setAttribute("data-read-frog-walked", walkId);

  if (element.shadowRoot) {
    for (const child of element.shadowRoot.children) {
      if (child instanceof HTMLElement) {
        walkAndLabelElement(child, walkId);
      }
    }
  }

  if (INVALID_TRANSLATE_TAGS.has(element.tagName)) return;

  let hasInlineNodeChild = false;
  // let hasBlockNodeChild = false;

  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      hasInlineNodeChild = true;
      continue;
    }

    if (child instanceof HTMLElement) {
      if (isInlineHTMLElement(child) && child.textContent?.trim()) {
        hasInlineNodeChild = true;
      }

      walkAndLabelElement(child, walkId);
    }
  }

  // if (hasInlineNodeChild && !hasBlockNodeChild) {
  //   node.setAttribute("data-read-frog-leaf-block-node", "");
  // }

  if (hasInlineNodeChild) {
    element.setAttribute("data-read-frog-paragraph", "");
  }
}

export function translateWalkedElement(element: HTMLElement, walkId: string) {
  // if the walkId is not the same, return
  if (element.getAttribute("data-read-frog-walked") !== walkId) return;

  console.log("element", element);
  if (element.classList.contains("fd-step")) {
    logger.info("fd-step", element);
  }

  if (element.hasAttribute("data-read-frog-paragraph")) {
    let hasBlockNodeChild = false;

    for (const child of element.childNodes) {
      if (isBlockTransNode(child)) {
        hasBlockNodeChild = true;
        break;
      }
    }

    if (!hasBlockNodeChild) {
      translateNode(element);
    } else {
      // prevent children change during iteration
      const children = Array.from(element.childNodes);
      for (const child of children) {
        if (!child.textContent?.trim()) {
          continue;
        }

        if (child instanceof Text) {
          translateNode(child);
        } else if (child instanceof HTMLElement) {
          translateWalkedElement(child, walkId);
        }
      }
    }
  } else {
    for (const child of element.childNodes) {
      if (child instanceof HTMLElement) {
        translateWalkedElement(child, walkId);
      }
    }
    if (element.shadowRoot) {
      for (const child of element.shadowRoot.children) {
        if (child instanceof HTMLElement) {
          translateWalkedElement(child, walkId);
        }
      }
    }
  }
}

export function unwrapDeepestOnlyChild(element: HTMLElement) {
  let currentElement = element;
  while (currentElement) {
    smashTruncationStyle(currentElement);

    const onlyChild =
      currentElement.childNodes.length === 1 &&
      currentElement.children.length === 1;
    if (!onlyChild) break;

    const onlyChildElement = currentElement.children[0];
    if (!(onlyChildElement instanceof HTMLElement)) break;

    currentElement = onlyChildElement;
  }

  return currentElement;
}
