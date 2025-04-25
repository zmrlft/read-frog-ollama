// import { onMessage } from "@/utils/message";
import { LangCodeISO6393, langCodeToEnglishName } from "@/types/languages";
import { useSetAtom } from "jotai";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import { isSideOpenAtom } from "../../atoms";

export const TopBar = () => {
  const [sourceLangCode, setSourceLangCode] = useState<
    LangCodeISO6393 | "auto" | undefined
  >(undefined);
  const [targetLangCode, setTargetLangCode] = useState<
    LangCodeISO6393 | undefined
  >(undefined);

  const setIsSideOpen = useSetAtom(isSideOpenAtom);

  useEffect(() => {
    let unwatchSourceLangCode: () => void;
    let unwatchTargetLangCode: () => void;

    const loadLang = async () => {
      const sourceLangCode = await storage.getItem<LangCodeISO6393 | "auto">(
        "local:readBuddy_sourceLangCode"
      );
      if (sourceLangCode) setSourceLangCode(sourceLangCode);

      unwatchSourceLangCode = await storage.watch<LangCodeISO6393 | "auto">(
        "local:readBuddy_sourceLangCode",
        (newLang, _oldLang) => {
          if (newLang) setSourceLangCode(newLang);
        }
      );

      const targetLangCode = await storage.getItem<LangCodeISO6393>(
        "local:readBuddy_targetLangCode"
      );
      if (targetLangCode) setTargetLangCode(targetLangCode);

      unwatchTargetLangCode = await storage.watch<LangCodeISO6393>(
        "local:readBuddy_targetLangCode",
        (newLang, _oldLang) => {
          if (newLang) setTargetLangCode(newLang);
        }
      );
    };
    loadLang();

    return () => {
      unwatchSourceLangCode?.();
      unwatchTargetLangCode?.();
    };
  }, []);

  return (
    <div className="border-b border-border flex justify-between">
      <div className="flex text-sm">
        <div className="flex items-center gap-2 px-2 py-1 border-r border-border">
          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
          <span className="max-w-16 truncate">
            {sourceLangCode === "auto"
              ? "Auto"
              : langCodeToEnglishName[sourceLangCode as LangCodeISO6393]}
          </span>
          <ArrowRight size={12} strokeWidth={1} className="-mx-1" />
          <span className="max-w-16 truncate">
            {targetLangCode && langCodeToEnglishName[targetLangCode]}
          </span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 border-r border-border">
          <div className="w-1 h-1 rounded-full bg-green-500"></div>
          <span className="font-medium">Level:</span>
          <span className="">Intermediate</span>
        </div>
      </div>
      <div className="flex">
        <button
          className="h-full border-l flex items-center justify-center hover:bg-border w-7"
          onClick={() => setIsSideOpen(false)}
        >
          <RotateCcw size={16} strokeWidth={1} />
        </button>
        <button
          className="h-full border-l flex items-center justify-center hover:bg-border w-7"
          onClick={() => setIsSideOpen(false)}
        >
          <X size={20} strokeWidth={1} />
        </button>
      </div>
    </div>
  );
};
