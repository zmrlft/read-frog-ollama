import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { ArrowRight, ChevronDown, Settings } from "lucide-react";
// import { browser } from "wxt/browser";

function App() {
  return (
    <>
      <div className="pt-5 px-6 pb-4 flex flex-col gap-4 bg-background">
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center w-32 h-13 justify-between bg-input/50 hover:bg-input rounded-lg">
            <span className="text-sm text-neutral-500 pt-5 pl-4">自动检测</span>
            <ChevronDown
              className="absolute right-2 text-neutral-400 dark:text-neutral-600 w-5 h-5"
              strokeWidth={1.5}
            />
            <select className="absolute insect-0 pb-4 pl-4 pr-8 w-32 text-base outline-none appearance-none truncate font-medium bg-transparent cursor-pointer">
              <option value="light">Longword This</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-500" strokeWidth={2} />
          <div className="relative inline-flex items-center w-32 h-13 justify-between bg-input/50 hover:bg-input rounded-lg">
            <span className="text-sm text-neutral-500 pt-5 pl-4">目标语言</span>
            <ChevronDown
              className="absolute right-2 text-neutral-400 dark:text-neutral-600 w-5 h-5"
              strokeWidth={1.5}
            />
            <select className="absolute insect-0 pb-4 pl-4 pr-8 w-32 text-base outline-none appearance-none truncate font-medium bg-transparent cursor-pointer">
              <option value="light">Longword This</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
        <div className="text-[13px] font-medium">翻译服务</div>
        <div className="text-[13px] font-medium">你的目标语言水平</div>
        <Button>开始翻译</Button>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-[13px]">开启悬浮按钮</span>
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
        <span className=" font-medium">设置</span>
      </div>
    </>
  );
}

export default App;
