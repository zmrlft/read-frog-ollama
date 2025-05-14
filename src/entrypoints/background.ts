import { onMessage, sendMessage } from "@/utils/message";

export default defineBackground(async () => {
  logger.info("Hello background!", { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(async (details) => {
    await storage.setItem<number>("local:__configSchemaVersion", 1);
    await initializeConfig();

    // Open tutorial page when extension is installed
    if (details.reason === "install") {
      await browser.tabs.create({
        url: "https://readfrog.mengxi.work/tutorial/installation",
      });
    }
  });

  onMessage("openOptionsPage", () => {
    logger.info("openOptionsPage");
    browser.runtime.openOptionsPage();
  });

  try {
    // wait for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tabId = tabs[0]?.id;
    console.log("tabs", tabs);
    if (tabId) {
      logger.info("Sending to tab", tabId);
      // Only try to get the status if explicitly requested
      const pageTranslation = await sendMessage(
        "getShowPageTranslation",
        undefined,
        { tabId, frameId: 0 },
      );
      logger.info("pageTranslation", pageTranslation);
    }
  } catch (error) {
    logger.error("Error getting tab info:", error);
  }
});
