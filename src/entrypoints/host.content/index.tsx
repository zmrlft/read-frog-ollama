import "@/assets/tailwind/theme.css";
import "@/assets/tailwind/text-small.css";
import { CONFIG_STORAGE_KEY } from "@/utils/constants/config";
import { Config } from "@/types/config/config";
import { handleTranslate } from "@/utils/host/translate";

export let globalConfig: Config | null = null;

export default defineContentScript({
  matches: ["*://*/*"],
  async main(ctx) {
    const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`);
    globalConfig = config;
    registerTranslationTriggers();
    const ui = createIntegratedUi(ctx, {
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        // Append children to the container
        // const app = document.createElement("p");
        // app.textContent = "Hello host.content!";
        // container.append(app);
      },
    });

    // Call mount to add the UI to the DOM
    ui.mount();
  },
});

function registerTranslationTriggers() {
  const hotkey = globalConfig?.manualTranslate.hotkey;

  const mousePosition = { x: 0, y: 0 };
  const keyPressed = {
    hotkeyPressed: false,
    otherKeyPressed: false,
  };

  window.addEventListener("blur", () => {
    keyPressed.hotkeyPressed = false;
    keyPressed.otherKeyPressed = false;
  });

  window.addEventListener("keydown", (e) => {
    console.log("keydown", e.key);
    if (e.key === hotkey) {
      keyPressed.hotkeyPressed = true;
    } else {
      keyPressed.otherKeyPressed = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    console.log("keyup", e.key);
    if (e.key === hotkey) {
      keyPressed.hotkeyPressed = false;
      if (e.key === hotkey && !keyPressed.otherKeyPressed) {
        // DO Translation
        handleTranslate(mousePosition.x, mousePosition.y);
      }
    } else {
      keyPressed.otherKeyPressed = false;
    }
  });

  document.body.addEventListener("mousemove", (event) => {
    console.log("mousemove", event.clientX, event.clientY);
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  });
}
