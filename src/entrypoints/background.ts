import { LangCodeISO6393, LangLevel } from "@/types/languages";
import { APP_PREFIX } from "@/utils/constants/app";

type InitialValues = {
  sourceLangCode: LangCodeISO6393 | "auto";
  targetLangCode: LangCodeISO6393;
  langLevel: LangLevel;
  showFloatingButton: boolean;
  openaiModel: string;
};

const initialValues: InitialValues = {
  sourceLangCode: "auto",
  targetLangCode: "cmn",
  langLevel: "intermediate",
  showFloatingButton: true,
  openaiModel: "gpt-4.1-mini",
};

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  browser.runtime.onStartup.addListener(async () => {
    await initializeLanguageSettings();
  });

  browser.runtime.onInstalled.addListener(async () => {
    await initializeLanguageSettings();
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "openOptionsPage") {
      browser.runtime.openOptionsPage();
    }
  });
});

async function initializeLanguageSettings() {
  await Promise.all(
    Object.entries(initialValues).map(async ([key, value]) => {
      const storedValue = await storage.getItem(`local:${APP_PREFIX}_${key}`);
      if (!storedValue) {
        await storage.setItem(`local:${APP_PREFIX}_${key}`, value);
      }
    })
  );
}
