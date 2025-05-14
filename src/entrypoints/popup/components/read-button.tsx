import { useAtomValue } from "jotai";

import { Button } from "@/components/ui/button";

import { isEmptyTabAtom } from "../atom";

export default function ReadButton({ className }: { className?: string }) {
  const isEmptyTab = useAtomValue(isEmptyTabAtom);

  const requestReadArticle = async () => {
    const [currentTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (currentTab.id) {
      sendMessage("popupRequestReadArticle", {
        tabId: currentTab.id,
      });
    }
  };

  return (
    <Button
      onClick={requestReadArticle}
      className={cn("border-primary", className)}
      disabled={isEmptyTab}
    >
      Read Article
    </Button>
  );
}
