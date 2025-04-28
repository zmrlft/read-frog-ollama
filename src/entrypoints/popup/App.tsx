import { Button } from "@/components/ui/Button";
import { ChevronDown, Settings } from "lucide-react";
import { LanguageOptions } from "./components/LanguageOptions";
import { LanguageLevel } from "./components/LanguageLevel";
import { ShowFloatingButton } from "./components/ShowFloatingButton";

function App() {
  return (
    <>
      <div className="pt-5 px-6 pb-4 flex flex-col gap-4 bg-background">
        <LanguageOptions />
        <div className="flex items-center gap-2 justify-between">
          <span className="font-medium text-[13px]">
            {i18n.t("translateService")}
          </span>
          <div className="flex items-center gap-1 pr-1.5 pl-2.5 py-1 rounded-sm text-sm bg-input/50 hover:bg-input">
            <select className="outline-none appearance-none cursor-pointer">
              <option value="openai">OpenAI</option>
              {/* <option value="deepseek">DeepSeek</option> */}
            </select>
            <ChevronDown
              className="text-neutral-400 dark:text-neutral-600 w-4 h-4"
              strokeWidth={1.5}
            />
          </div>
        </div>
        <LanguageLevel />
        {/* <Button>{i18n.t("popup.readForMe")}</Button> */}
        <ShowFloatingButton />
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
