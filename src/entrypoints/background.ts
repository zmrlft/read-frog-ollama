import { LangCodeISO6393, LangLevel } from "@/types/languages";
import { Provider, ProviderConfig } from "@/types/provider";

type InitialValues = {
  sourceLangCode: LangCodeISO6393 | "auto";
  targetLangCode: LangCodeISO6393;
  langLevel: LangLevel;
  showFloatingButton: boolean;
  provider: Provider;
  providerConfig: ProviderConfig;
};

const initialValues: InitialValues = {
  sourceLangCode: "auto",
  targetLangCode: "cmn",
  langLevel: "intermediate",
  showFloatingButton: true,
  provider: "openai",
  providerConfig: defaultProviderConfig,
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
    const providerConfig = await storage.getItem<ProviderConfig>(
      `local:providerConfig`
    );
    if (providerConfig) {
      const providerConfigWithApiKey = Object.fromEntries(
        Object.entries(providerConfig).map(([provider, config]) => {
          const apiKeyEnvName = `WXT_${provider.toUpperCase()}_API_KEY`;
          return [
            provider,
            { ...config, apiKey: import.meta.env[apiKeyEnvName] },
          ];
        })
      );
      await storage.setItem(`local:providerConfig`, providerConfigWithApiKey);
    }
  }
  // await storage.setItem<string>(
  //   "local:openaiApiKey",
  //   import.meta.env.WXT_OPENAI_API_KEY
  // );
}
