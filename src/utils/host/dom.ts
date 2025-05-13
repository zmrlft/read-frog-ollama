import { FORCE_BLOCK_NODES, INVALID_TRANSLATE_TAGS } from "../constants/dom";
import { translateNode } from "./translate-node";

export function isEditable(el: HTMLElement) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  return false;
}

/**
 * Select element from the point (allow select element in shadow root)
 * @param root - The root element (Document or ShadowRoot)
 * @param x - The x coordinate of the point
 * @param y - The y coordinate of the point
 */
export function deepElementFromPoint(
  root: Document | ShadowRoot,
  x: number,
  y: number,
) {
  const el = root.elementFromPoint(x, y);
  if (el && el.shadowRoot) {
    return deepElementFromPoint(el.shadowRoot, x, y);
  }
  return el;
}

export function selectNode(mouseX: number, mouseY: number) {
  let currentNode = deepElementFromPoint(document, mouseX, mouseY);

  while (
    currentNode &&
    (window.getComputedStyle(currentNode).display.includes("inline") ||
      currentNode.className.includes("notranslate"))
  ) {
    if (FORCE_BLOCK_NODES.has(currentNode.tagName)) {
      break;
    }
    currentNode = currentNode.parentElement;
  }

  return currentNode;
}

export function smashTruncationStyle(node: HTMLElement) {
  if (node.style && node.style.webkitLineClamp) {
    node.style.webkitLineClamp = "unset";
  }
  if (node.style && node.style.maxHeight) {
    node.style.maxHeight = "unset";
  }
}

export function getTextContent(node: HTMLElement | Text): string {
  if (node instanceof Text) {
    return node.textContent ?? "";
  }

  // Skip if the node has sr-only class
  if (node.classList.contains("sr-only")) {
    return "";
  }

  // Get all child nodes
  const childNodes = Array.from(node.childNodes);

  return childNodes.reduce((text: string, child: Node): string => {
    // If it's a text node, add its content
    if (child.nodeType === Node.TEXT_NODE) {
      return text + child.textContent;
    }

    // If it's an element node, recursively get its text content
    if (child instanceof HTMLElement && child.nodeType === Node.ELEMENT_NODE) {
      return text + getTextContent(child);
    }

    return text;
  }, "");
}

export function walkAndLabelDom(node: Node, id: string) {
  if (
    !(node instanceof HTMLElement) ||
    INVALID_TRANSLATE_TAGS.has(node.tagName)
  ) {
    return;
  }

  let hasInlineNodeChild = false;
  // let hasBlockNodeChild = false;

  for (const child of node.childNodes) {
    // if child is a text node, add it to the node's text content
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      hasInlineNodeChild = true;
      continue;
    }

    if (child instanceof HTMLElement) {
      if (child.className.includes("notranslate")) {
        continue;
      }

      if (
        window.getComputedStyle(child).display.includes("inline") &&
        !FORCE_BLOCK_NODES.has(child.tagName)
      ) {
        child.setAttribute("data-read-frog-walked", id);
        if (child.textContent?.trim()) {
          hasInlineNodeChild = true;
        }
        continue;
      }

      // hasBlockNodeChild = true;
      if (child.textContent?.trim()) {
        walkAndLabelDom(child, id);
      }
    }
  }

  // if (hasInlineNodeChild && !hasBlockNodeChild) {
  //   node.setAttribute("data-read-frog-leaf-block-node", "");
  // }

  if (hasInlineNodeChild) {
    node.setAttribute("data-read-frog-paragraph", "");
  }

  node.setAttribute("data-read-frog-walked", id);
}

export function isBlockNode(node: Node) {
  if (
    !(node instanceof HTMLElement) ||
    node.className.includes("notranslate")
  ) {
    return false;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return false;
  }

  return (
    FORCE_BLOCK_NODES.has(node.tagName) ||
    !window.getComputedStyle(node).display.includes("inline")
  );
}

export function translateWalkedNode(node: Node) {
  if (
    !(node instanceof HTMLElement) ||
    !node.hasAttribute("data-read-frog-walked")
  ) {
    return;
  }

  // if the node has data-read-frog-paragraph = "true"
  if (node.hasAttribute("data-read-frog-paragraph")) {
    let hasBlockNodeChild = false;

    for (const child of node.childNodes) {
      if (isBlockNode(child)) {
        hasBlockNodeChild = true;
      }
    }

    if (!hasBlockNodeChild) {
      translateNode(node);
      // node.appendChild(document.createTextNode("Translated"));
    } else {
      const children = Array.from(node.childNodes); // Static snapshot, prevent live node change
      for (const child of children) {
        if (!child.textContent?.trim()) {
          continue;
        }

        if (child instanceof Text) {
          // const newText = document.createTextNode("Translated");
          // node.insertBefore(newText, child.nextSibling);
          translateNode(child);
        } else if (child instanceof HTMLElement) {
          translateWalkedNode(child);
        }
      }
    }
  } else {
    for (const child of node.childNodes) {
      translateWalkedNode(child);
    }
  }
}
