export const addStyleToShadow = (shadow: ShadowRoot) => {
  document.head.querySelectorAll("style").forEach((styleEl) => {
    if (styleEl.textContent?.includes("[data-sonner-toaster]")) {
      const shadowHead = shadow.querySelector("head");
      if (shadowHead) {
        shadowHead.append(styleEl);
      } else {
        shadow.append(styleEl);
      }
    }
  });
};

export const mirrorDynamicStyles = (
  selector: string,
  shadowRoot: ShadowRoot,
  contentMatch?: string
) => {
  // TODO: 目前函数只会把找到的第一个 style 放进来，但是可能存在多个 style 匹配，那其实要全部放进来，并且对应不同的 mirrorSheet
  const mirrorSheet = new CSSStyleSheet();
  shadowRoot.adoptedStyleSheets.push(mirrorSheet);

  // Find all elements matching selector, then filter by content if contentMatch is provided
  const findMatchingElement = () => {
    const elements = Array.from(document.querySelectorAll(selector));
    if (contentMatch) {
      return elements.find(
        (el) =>
          el instanceof HTMLStyleElement &&
          el.textContent?.includes(contentMatch)
      );
    }
    // If no contentMatch is provided, return the first matching element
    return elements.find((el) => el instanceof HTMLStyleElement);
  };

  let src = findMatchingElement();
  console.log("src", src);

  const opts = {
    characterData: true,
    childList: true,
    subtree: true,
    attributes: true,
  };

  const srcObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mirrorSheet.replaceSync(mutation.target.textContent?.trim() ?? "");
      console.log(
        "replace sync in src observer",
        Array.from(shadowRoot.adoptedStyleSheets)
      );
    });
  });

  // If src is found, observe it
  if (src) {
    srcObserver.observe(src, opts);
    mirrorSheet.replaceSync(src.textContent?.trim() ?? "");
    console.log(
      "replace sync in src",
      Array.from(shadowRoot.adoptedStyleSheets)
    );
  }

  // Observe the head for added style elements
  const headObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLStyleElement && node.matches(selector)) {
          // Only check content if contentMatch is provided
          console.log("match node", selector, node);
          if (!contentMatch || node.textContent?.includes(contentMatch)) {
            console.log("match contain", contentMatch);
            src = node;
            mirrorSheet.replaceSync(node.textContent?.trim() ?? "");
            console.log(
              "replace sync in addnode",
              Array.from(shadowRoot.adoptedStyleSheets)
            );
            srcObserver.observe(src, opts);
          }
        }
      });
      // TODO: handle removed nodes
    });
  });

  headObserver.observe(document.head, { childList: true });
};
