import { LangLevel } from "@/types/languages";
import { useStorageState } from "@/hooks/useStorageState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export const LanguageLevelSelector = () => {
  const [langLevel, setLangLevel] = useStorageState<LangLevel>(
    "langLevel",
    "intermediate"
  );

  return (
    <div className="flex items-center gap-2 justify-between">
      <span className="font-medium text-[13px]">{i18n.t("languageLevel")}</span>
      <Select value={langLevel} onValueChange={setLangLevel}>
        <SelectTrigger className="outline-none cursor-pointer bg-input/50 hover:bg-input w-27 h-7 pl-2.5 pr-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
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
    </div>
  );
};
