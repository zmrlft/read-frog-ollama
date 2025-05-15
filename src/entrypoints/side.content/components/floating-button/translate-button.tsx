import { useAtom, useAtomValue } from "jotai";
import { Check } from "lucide-react";
import { Languages } from "lucide-react";
import { toast } from "sonner";

import { configFields } from "@/utils/atoms/config";
import { isPageTranslatedAtom } from "@/utils/atoms/translation";
import { removeAllTranslatedWrapperNodes } from "@/utils/host/translate";
import { translatePage } from "@/utils/host/translate";

import HiddenButton from "./components/hidden-button";

export default function TranslateButton() {
  const [isPageTranslated, setIsPageTranslated] = useAtom(isPageTranslatedAtom);
  const providersConfig = useAtomValue(configFields.providersConfig);

  useEffect(() => {
    const removeListener = onMessage(
      "setIsPageTranslatedOnSideContent",
      async (message) => {
        if (message.data.isPageTranslated) {
          translatePage();
          setIsPageTranslated(true);
        } else {
          removeAllTranslatedWrapperNodes();
          setIsPageTranslated(false);
        }
      },
    );

    return () => {
      removeListener();
    };
  }, []);

  return (
    <HiddenButton
      Icon={Languages}
      onClick={() => {
        if (!isAnyAPIKey(providersConfig)) {
          toast.error("Please set API key on the options page first");
          return;
        }
        if (!isPageTranslated) {
          translatePage();
          setIsPageTranslated(true);
          sendMessage("uploadIsPageTranslated", {
            isPageTranslated: true,
          });
        } else {
          removeAllTranslatedWrapperNodes();
          setIsPageTranslated(false);
          sendMessage("uploadIsPageTranslated", {
            isPageTranslated: false,
          });
        }
      }}
    >
      <Check
        className={cn(
          "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-green-500 text-white",
          isPageTranslated ? "block" : "hidden",
        )}
      />
    </HiddenButton>
  );
}
