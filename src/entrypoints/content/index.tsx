import ReactDOM from "react-dom/client";
import App from "./App";
import "@/assets/tailwind/theme.css";
import "@/assets/tailwind/text-small.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHydrateAtoms } from "jotai/react/utils";
import { queryClientAtom } from "jotai-tanstack-query";
import { Provider as JotaiProvider } from "jotai/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "./atoms";

const addStyleToShadow = (shadow: ShadowRoot) => {
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

  // TODO: if development mode, then add devtool
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLStyleElement && node.id === "_goober") {
          const shadowHead = shadow.querySelector("head");
          if (shadowHead) {
            shadowHead.append(node);
          } else {
            shadow.append(node);
          }
          observer.disconnect();
        }
      });
    });
  });

  observer.observe(document.head, {
    childList: true,
    subtree: true,
  });
};

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "read-buddy",
      position: "overlay",
      anchor: "body",
      append: "last",
      onMount: (container, shadow) => {
        const wrapper = document.createElement("div");
        container.appendChild(wrapper);

        const root = ReactDOM.createRoot(wrapper);

        addStyleToShadow(shadow);

        const queryClient = new QueryClient();
        const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
          useHydrateAtoms([[queryClientAtom, queryClient]]);
          return children;
        };
        root.render(
          <QueryClientProvider client={queryClient}>
            <JotaiProvider store={store}>
              <HydrateAtoms>
                <App />
              </HydrateAtoms>
            </JotaiProvider>
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
            />
          </QueryClientProvider>
        );
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
