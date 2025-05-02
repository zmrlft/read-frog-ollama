import { LangCodeISO6393, LangLevel } from "@/types/languages";

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
      const storedValue = await storage.getItem(`local:${key}`);
      if (!storedValue) {
        await storage.setItem(`local:${key}`, value);
      }
    })
  );

  if (import.meta.env.DEV) {
    await storage.setItem<string>(
      "local:openaiApiKey",
      import.meta.env.WXT_OPENAI_API_KEY
    );
  }
}
