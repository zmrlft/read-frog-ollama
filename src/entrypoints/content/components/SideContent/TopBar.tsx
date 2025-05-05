// import { onMessage } from "@/utils/message";
import {
  LangCodeISO6393,
  langCodeToEnglishName,
  LangLevel,
} from "@/types/languages";
import { useSetAtom } from "jotai";
import { ArrowRight, X } from "lucide-react";
import { isSideOpenAtom } from "../../atoms";
import { cn } from "@/utils/tailwind";
import { Provider } from "@/types/provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import { shadowWrapper } from "../..";

export const TopBar = ({ className }: { className?: string }) => {
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
    <div className={cn("flex justify-between items-start", className)}>
      <div className="flex text-sm gap-x-2">
        <div className="flex items-center h-7 gap-2 px-2 border rounded-md border-border hover:bg-muted">
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
        {/* <div className="flex items-center h-7 gap-2 px-2 border rounded-md border-border hover:bg-muted">
          <div className="w-1 h-1 rounded-full bg-orange-500"></div>
          <span className="">{i18n.t(`languageLevels.${langLevel}`)}</span>
        </div> */}
        <LangLevelSelect />
        <ProviderSelect />
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

const ProviderSelect = () => {
  const [provider, setProvider] = useStorageState<Provider>(
    "provider",
    "openai"
  );

  return (
    <Select value={provider} onValueChange={setProvider}>
      <SelectTrigger
        hideChevron
        className="size-7 p-0 flex items-center justify-center"
      >
        <img
          src={providerItems[provider].logo}
          alt={provider}
          className="size-4 rounded-full border bg-white"
        />
      </SelectTrigger>
      <SelectContent container={shadowWrapper}>
        {Object.entries(providerItems).map(([provider, { logo, name }]) => (
          <SelectItem key={provider} value={provider}>
            <div className="flex items-center gap-x-2">
              <img
                src={logo}
                alt={name}
                className="size-4 rounded-full border bg-white"
              />
              <span>{name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const LangLevelSelect = () => {
  const [langLevel, setLangLevel] = useStorageState<LangLevel>(
    "langLevel",
    "intermediate"
  );

  return (
    <Select value={langLevel} onValueChange={setLangLevel}>
      <SelectTrigger
        hideChevron
        className="flex items-center h-7 gap-2 px-2 border rounded-md border-border w-auto"
      >
        <div className="w-1 h-1 rounded-full bg-orange-500 shrink-0"></div>
        <div className="min-w-0 max-w-16 truncate">
          {i18n.t(`languageLevels.${langLevel}`)}
        </div>
      </SelectTrigger>
      <SelectContent container={shadowWrapper}>
        <SelectItem value="beginner">
          {i18n.t("languageLevels.beginner")}
        </SelectItem>
        <SelectItem value="intermediate">
          {i18n.t("languageLevels.intermediate")}
        </SelectItem>
        <SelectItem value="advanced">
          {i18n.t("languageLevels.advanced")}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
