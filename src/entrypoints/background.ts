export default defineBackground(() => {
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

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "openOptionsPage") {
      browser.runtime.openOptionsPage();
    }
  });
});
