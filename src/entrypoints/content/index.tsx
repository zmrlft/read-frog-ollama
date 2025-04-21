import ReactDOM from "react-dom/client";
import App from "./App";
import "@/assets/tailwind/theme.css";
import "@/assets/tailwind/text-small.css";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "read-buddy",
      position: "overlay",
      anchor: "body",
      append: "last",
      onMount: (container) => {
        const wrapper = document.createElement("div");
        container.appendChild(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<App />);
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
