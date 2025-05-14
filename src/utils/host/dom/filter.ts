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
  return (
    (window.getComputedStyle(element).display.includes("inline") ||
      element.className.includes("notranslate")) &&
    !FORCE_BLOCK_TAGS.has(element.tagName)
  );
}

export function isBlockTransNode(node: Node): boolean {
  if (node instanceof Text) {
    return false;
  } else if (node instanceof HTMLElement) {
    return !isInlineHTMLElement(node);
  }
  return false;
}
