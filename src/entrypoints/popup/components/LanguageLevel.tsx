import { LangLevel } from "@/types/languages";
import { ChevronDown } from "lucide-react";
import { useStorageState } from "@/hooks/useStorageState";

export const LanguageLevel = () => {
  const [langLevel, setLangLevel] = useStorageState<LangLevel>(
    "langLevel",
    "intermediate"
  );

  const handleLangLevelChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLangLevel = e.target.value as LangLevel;
    await setLangLevel(newLangLevel);
  };

  return (
    <div className="flex items-center gap-2 justify-between">
      <span className="font-medium text-[13px]">{i18n.t("languageLevel")}</span>
      <div className="flex items-center gap-1 pr-1.5 pl-2.5 py-1 rounded-sm text-sm bg-input/50 hover:bg-input">
        <select
          className="outline-none appearance-none cursor-pointer"
          value={langLevel}
          onChange={handleLangLevelChange}
        >
          <option value="beginner">{i18n.t("languageLevels.beginner")}</option>
          <option value="intermediate">
            {i18n.t("languageLevels.intermediate")}
          </option>
          <option value="advanced">{i18n.t("languageLevels.advanced")}</option>
        </select>
        <ChevronDown
          className="text-neutral-400 dark:text-neutral-600 w-4 h-4"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
};
