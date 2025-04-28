// import { onMessage } from "@/utils/message";
import {
  LangCodeISO6393,
  langCodeToEnglishName,
  LangLevel,
} from "@/types/languages";
import { useSetAtom } from "jotai";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import { isSideOpenAtom } from "../../atoms";
import { useStorageStateValue } from "@/hooks/useStorageState";
export const TopBar = () => {
  const langLevel = useStorageStateValue<LangLevel>(
    "langLevel",
    "intermediate"
  );
  const sourceLangCode = useStorageStateValue<
    LangCodeISO6393 | "auto" | undefined
  >("sourceLangCode", undefined);
  const targetLangCode = useStorageStateValue<LangCodeISO6393 | undefined>(
    "targetLangCode",
    undefined
  );

  const setIsSideOpen = useSetAtom(isSideOpenAtom);

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
          <span className="">{i18n.t(`languageLevels.${langLevel}`)}</span>
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
