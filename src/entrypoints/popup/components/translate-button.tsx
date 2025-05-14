import { useAtom, useAtomValue } from "jotai";

import { Button } from "@/components/ui/button";
import { isPageTranslatedAtom } from "@/utils/atoms/translation";

import { isEmptyTabAtom } from "../atom";

export default function TranslateButton({ className }: { className?: string }) {
  const [isPageTranslated, setIsPageTranslated] = useAtom(isPageTranslatedAtom);
  const isEmptyTab = useAtomValue(isEmptyTabAtom);

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
    <Button
      onClick={toggleTranslation}
      disabled={isEmptyTab}
      variant="outline"
      className={cn("border-primary", className)}
    >
      {isPageTranslated ? "Show original" : "Translate"}
    </Button>
  );
}
