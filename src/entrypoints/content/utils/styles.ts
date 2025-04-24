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

export const mirrorDynamicStyle = (
  selector: string,
  shadowRoot: ShadowRoot
) => {
  const mirrorSheet = new CSSStyleSheet();
  shadowRoot.adoptedStyleSheets.push(mirrorSheet);

  // console.log("adoptedStyleSheets", Array.from(shadowRoot.adoptedStyleSheets));

  let src = document.querySelector(selector); // the result might be null

  const opts = {
    characterData: true,
    childList: true,
    subtree: true,
    attributes: true,
  };

  const srcObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mirrorSheet.replaceSync(mutation.target.textContent?.trim() ?? "");
    });
  });

  // if src is found, then observe it
  if (src) {
    srcObserver.observe(src, opts);
  }

  // if src is not found initially, then observe the head add src style for changes
  const headObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLStyleElement && node.id === "_goober") {
          src = node;
          mirrorSheet.replaceSync(node.textContent?.trim() ?? "");
          srcObserver.observe(src, opts);
        }
      });
    });
  });

  headObserver.observe(document.head, { childList: true });
};
