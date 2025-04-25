import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import {
  langCodeToEnglishName,
  LangCodeISO6393,
  langCodeISO6393,
} from "@/types/languages";
import { ArrowRight, ChevronDown, Settings } from "lucide-react";

function App() {
  const [detectedLang, setDetectedLang] = useState<LangCodeISO6393>("eng");
  const [sourceLang, setSourceLang] = useState<LangCodeISO6393 | "auto">(
    "auto"
  );
  const [targetLang, setTargetLang] = useState<LangCodeISO6393>("eng");

  useEffect(() => {
    let unwatch: () => void;

    const loadLang = async () => {
      const lang = await storage.getItem<LangCodeISO6393>(
        "local:readBuddy_sourceLangCode"
      );
      if (lang) setSourceLang(lang);

      unwatch = await storage.watch<LangCodeISO6393>(
        "local:readBuddy_sourceLangCode",
        (newLang, _oldLang) => {
          if (newLang) setSourceLang(newLang);
        }
      );
    };
    loadLang();

    return () => {
      unwatch?.();
    };
  }, []);

  useEffect(() => {
    let unwatch: () => void;

    const loadLang = async () => {
      const lang = await storage.getItem<LangCodeISO6393>(
        "local:readBuddy_targetLangCode"
      );
      if (lang) setTargetLang(lang);

      unwatch = await storage.watch<LangCodeISO6393>(
        "local:readBuddy_targetLangCode",
        (newLang, _oldLang) => {
          if (newLang) setTargetLang(newLang);
        }
      );
    };
    loadLang();

    return () => {
      unwatch?.();
    };
  }, []);

  useEffect(() => {
    let unwatch: () => void;

    const loadLang = async () => {
      const lang = await storage.getItem<LangCodeISO6393>(
        "local:readBuddy_detectedLangCode"
      );
      if (lang) setDetectedLang(lang);

      unwatch = await storage.watch<LangCodeISO6393>(
        "local:readBuddy_detectedLangCode",
        (newLang, _oldLang) => {
          if (newLang) setDetectedLang(newLang);
        }
      );
    };
    loadLang();

    return () => {
      unwatch?.();
    };
  }, []);

  const handleSourceLangChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLang = e.target.value as LangCodeISO6393;
    await storage.setItem<LangCodeISO6393>(
      "local:readBuddy_sourceLangCode",
      newLang
    );
  };

  const handleTargetLangChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLang = e.target.value as LangCodeISO6393;
    await storage.setItem<LangCodeISO6393>(
      "local:readBuddy_targetLangCode",
      newLang
    );
  };

  console.log(detectedLang, sourceLang, targetLang);

  return (
    <>
      <div className="pt-5 px-6 pb-4 flex flex-col gap-4 bg-background">
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center w-32 h-13 justify-between bg-input/50 hover:bg-input rounded-lg">
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
          <div className="relative inline-flex items-center w-32 h-13 justify-between bg-input/50 hover:bg-input rounded-lg">
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
        <div className="flex items-center gap-2 justify-between">
          <span className="font-medium text-[13px]">
            {i18n.t("translateService")}
          </span>
          <div className="flex items-center gap-1 pr-1.5 pl-2.5 py-1 rounded-sm text-sm bg-input/50 hover:bg-input">
            <select className="outline-none appearance-none cursor-pointer">
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
            </select>
            <ChevronDown
              className="text-neutral-400 dark:text-neutral-600 w-4 h-4"
              strokeWidth={1.5}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <span className="font-medium text-[13px]">
            {i18n.t("languageLevel")}
          </span>
          <div className="flex items-center gap-1 pr-1.5 pl-2.5 py-1 rounded-sm text-sm bg-input/50 hover:bg-input">
            <select className="outline-none appearance-none cursor-pointer">
              <option value="beginner">
                {i18n.t("languageLevels.beginner")}
              </option>
              <option value="intermediate">
                {i18n.t("languageLevels.intermediate")}
              </option>
              <option value="advanced">
                {i18n.t("languageLevels.advanced")}
              </option>
            </select>
            <ChevronDown
              className="text-neutral-400 dark:text-neutral-600 w-4 h-4"
              strokeWidth={1.5}
            />
          </div>
        </div>
        <Button>{i18n.t("popup.readForMe")}</Button>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-[13px]">
            {i18n.t("popup.showFloatingButton")}
          </span>
          <Switch />
        </div>
      </div>
      <div
        className="p-2 flex items-center justify-center gap-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
        onClick={() => {
          browser.runtime.openOptionsPage();
        }}
      >
        <Settings className="w-4 h-4" strokeWidth={1.5} />
        <span className=" font-medium">{i18n.t("popup.setting")}</span>
      </div>
    </>
  );
}

export default App;
