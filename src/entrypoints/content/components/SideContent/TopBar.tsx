// import { onMessage } from "@/utils/message";
import {
  LangCodeISO6393,
  langCodeToEnglishName,
  LangLevel,
} from "@/types/languages";
import { useSetAtom } from "jotai";
import { ArrowRight, X } from "lucide-react";
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
    <div className="flex justify-between items-start">
      <div className="flex text-sm gap-x-2">
        <div className="flex items-center gap-2 px-2 py-1 border rounded-md border-border hover:bg-muted">
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
        <div className="flex items-center gap-2 px-2 py-1 border rounded-md border-border hover:bg-muted">
          <div className="w-1 h-1 rounded-full bg-orange-500"></div>
          <span className="font-medium">Level:</span>
          <span className="">{i18n.t(`languageLevels.${langLevel}`)}</span>
        </div>
      </div>
      <button
        className="flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 rounded-full p-0.5 h-4 w-4 cursor-pointer"
        onClick={() => setIsSideOpen(false)}
      >
        <X strokeWidth={1.2} className="text-neutral-500" />
      </button>
    </div>
  );
};
