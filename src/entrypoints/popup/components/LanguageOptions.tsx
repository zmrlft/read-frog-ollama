import {
  langCodeISO6393,
  langCodeToEnglishName,
  LangCodeISO6393,
} from "@/types/languages";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useStorageState, useStorageStateValue } from "@/hooks/useStorageState";

export const LanguageOptions = () => {
  const detectedLang = useStorageStateValue<LangCodeISO6393>(
    "detectedLangCode",
    "eng"
  );

  const [sourceLang, setSourceLang] = useStorageState<LangCodeISO6393 | "auto">(
    "sourceLangCode",
    "auto"
  );
  const [targetLang, setTargetLang] = useStorageState<LangCodeISO6393>(
    "targetLangCode",
    "eng"
  );

  const handleSourceLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as LangCodeISO6393;
    setSourceLang(newLang);
  };

  const handleTargetLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as LangCodeISO6393;
    setTargetLang(newLang);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center w-32 h-13 justify-between bg-input/50 hover:bg-input rounded-lg border border-input shadow-xs">
        <span className="text-sm text-neutral-500 pt-5 pl-4">
          {sourceLang === "auto"
            ? i18n.t("popup.autoLang")
            : i18n.t("popup.sourceLang")}
        </span>
        <ChevronDown
          className="absolute right-2 text-neutral-400 dark:text-neutral-600 w-5 h-5"
          strokeWidth={1.5}
        />
        <select
          className="absolute insect-0 pb-4 pl-4 pr-8 w-32 text-base outline-none appearance-none truncate font-medium bg-transparent cursor-pointer"
          value={sourceLang}
          onChange={handleSourceLangChange}
        >
          <option value="auto">
            {langCodeToEnglishName[detectedLang as LangCodeISO6393]} (auto)
          </option>
          {langCodeISO6393.options.map(
            (key) =>
              key !== detectedLang && (
                <option key={key} value={key}>
                  {langCodeToEnglishName[key]}
                </option>
              )
          )}
        </select>
      </div>
      <ArrowRight className="w-4 h-4 text-neutral-500" strokeWidth={2} />
      <div className="relative inline-flex items-center w-32 h-13 justify-between bg-input/50 hover:bg-input rounded-lg border border-input shadow-xs">
        <span className="text-sm text-neutral-500 pt-5 pl-4">
          {i18n.t("popup.targetLang")}
        </span>
        <ChevronDown
          className="absolute right-2 text-neutral-400 dark:text-neutral-600 w-5 h-5"
          strokeWidth={1.5}
        />
        <select
          className="absolute insect-0 pb-4 pl-4 pr-8 w-32 text-base outline-none appearance-none truncate font-medium bg-transparent cursor-pointer"
          value={targetLang}
          onChange={handleTargetLangChange}
        >
          {langCodeISO6393.options.map((key) => (
            <option key={key} value={key}>
              {langCodeToEnglishName[key]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
