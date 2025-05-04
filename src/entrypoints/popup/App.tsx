import { Bolt } from "lucide-react";
import { LanguageOptions } from "./components/LanguageOptions";
import { LanguageLevelSelector } from "./components/LanguageLevel";
import { ShowFloatingButton } from "./components/ShowFloatingButton";
import { TranslateServiceSelector } from "./components/TranslateService";

function App() {
  return (
    <>
      <div className="pt-5 px-6 pb-4 flex flex-col gap-4 bg-background">
        <LanguageOptions />
        <TranslateServiceSelector />
        <LanguageLevelSelector />
        {/* <Button>{i18n.t("popup.readForMe")}</Button> */}
        <ShowFloatingButton />
      </div>
      <div
        className="p-2 flex items-center justify-center gap-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
        onClick={() => browser.runtime.openOptionsPage()}
      >
        <Bolt className="w-4 h-4" strokeWidth={1.6} />
        <span className=" font-medium">{i18n.t("popup.setting")}</span>
      </div>
    </>
  );
}

export default App;
