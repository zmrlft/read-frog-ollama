import { FORCE_BLOCK_TAGS } from "@/utils/constants/dom";

export function isEditable(element: HTMLElement): boolean {
  const tag = element.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if (element.isContentEditable) return true;
  return false;
}

export function isInlineTransNode(node: Node): boolean {
  if (node instanceof Text) {
    return true;
  } else if (node instanceof HTMLElement) {
    return isInlineHTMLElement(node);
  }
  return false;
}

export function isInlineHTMLElement(element: HTMLElement): boolean {
  if (element.classList.contains("notranslate")) {
    return false;
  }

  return (
    window.getComputedStyle(element).display.includes("inline") &&
    !FORCE_BLOCK_TAGS.has(element.tagName)
  );
}

// Note: !(inline node) != block node because of `notranslate` class and all cases not in the if else block
export function isBlockTransNode(node: Node): boolean {
  if (node instanceof Text) {
    return false;
  } else if (node instanceof HTMLElement) {
    return isBlockElement(node);
  }
  return false;
}

export function isBlockElement(element: HTMLElement): boolean {
  if (element.classList.contains("notranslate")) {
    return false;
  }
  return (
    !window.getComputedStyle(element).display.includes("inline") ||
    FORCE_BLOCK_TAGS.has(element.tagName)
  );
}
