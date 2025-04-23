import ReactDOM from "react-dom/client";
import App from "./App";
import "@/assets/tailwind/theme.css";
import "@/assets/tailwind/text-small.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

        const queryClient = new QueryClient();
        root.render(
          <QueryClientProvider client={queryClient}>
            <App />
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
