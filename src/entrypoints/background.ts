import { LangCodeISO6393 } from "@/types/languages";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // 在浏览器启动时运行
  browser.runtime.onStartup.addListener(async () => {
    console.log("onStartup");
    await initializeLanguageSettings();
  });

  // 在扩展安装或更新时也运行
  browser.runtime.onInstalled.addListener(async () => {
    console.log("onInstalled");
    await initializeLanguageSettings();
  });

  // 初始化语言设置的函数
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
  }
});
