import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { isPageTranslatedAtom } from "@/utils/atoms/translation";

export default function TranslateButton() {
  const [isPageTranslated, setIsPageTranslated] = useAtom(isPageTranslatedAtom);
  const [isEmptyTab, setIsEmptyTab] = useState(false);

  useEffect(() => {
    // Check if current tab is an empty tab
    if (typeof window !== "undefined" && browser.tabs) {
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const isNewTab =
          currentTab?.url === "about:blank" ||
          currentTab?.url === "chrome://newtab/" ||
          currentTab?.url === "edge://newtab/" ||
          currentTab?.url?.startsWith("about:newtab") ||
          false;

        setIsEmptyTab(isNewTab);
      });
    }
  }, []);

  const toggleTranslation = async () => {
    const [currentTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (currentTab.id) {
      setIsPageTranslated((prev) => !prev);
      sendMessage("updateIsPageTranslated", {
        tabId: currentTab.id,
        isPageTranslated: !isPageTranslated,
      });
    }
  };

  return (
    <Button onClick={toggleTranslation} disabled={isEmptyTab}>
      {isPageTranslated ? "Show original" : "Translate"}
    </Button>
  );
}
