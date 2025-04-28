import { LangCodeISO6393, LangLevel } from "@/types/languages";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  browser.runtime.onStartup.addListener(async () => {
    console.log("onStartup");
    await initializeLanguageSettings();
  });

  browser.runtime.onInstalled.addListener(async () => {
    console.log("onInstalled");
    await initializeLanguageSettings();
  });

  async function initializeLanguageSettings() {
    const sourceLangCode = await storage.getItem<LangCodeISO6393 | "auto">(
      "local:readBuddy_sourceLangCode"
    );
    const targetLangCode = await storage.getItem<LangCodeISO6393>(
      "local:readBuddy_targetLangCode"
    );

    if (!sourceLangCode) {
      await storage.setItem<LangCodeISO6393 | "auto">(
        "local:readBuddy_sourceLangCode",
        "auto"
      );
    }

    if (!targetLangCode) {
      await storage.setItem<LangCodeISO6393>(
        "local:readBuddy_targetLangCode",
        "eng"
      );
    }

    const langLevel = await storage.getItem<LangLevel>(
      "local:readBuddy_langLevel"
    );

    if (!langLevel) {
      await storage.setItem<LangLevel>(
        "local:readBuddy_langLevel",
        "intermediate"
      );
    }

    const showFloatingButton = await storage.getItem<boolean>(
      "local:readBuddy_showFloatingButton"
    );

    if (!showFloatingButton) {
      await storage.setItem<boolean>(
        "local:readBuddy_showFloatingButton",
        true
      );
    }
  }
});
