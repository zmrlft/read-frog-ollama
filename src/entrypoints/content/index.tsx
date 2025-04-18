import ReactDOM from "react-dom/client";
import App from "./App";
import "@/assets/tailwind.css";
// import sheet from "@/assets/styles.css?inline";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    console.log("Floating script loaded"); // Debug log to confirm script is running

    // console.log("sheet", sheet);

    const ui = await createShadowRootUi(ctx, {
      name: "read-buddy",
      position: "overlay",
      anchor: "body",
      append: "last",
      onMount: (container) => {
        console.log("container", container);
        const wrapper = document.createElement("div");
        container.appendChild(wrapper);

        // if (container.shadowRoot) {
        //   const styleSheet = new CSSStyleSheet();
        //   styleSheet.replaceSync(sheet);
        //   container.shadowRoot.adoptedStyleSheets = [styleSheet];
        // }

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
