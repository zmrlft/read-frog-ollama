import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Select } from "@/components/ui/Select";
import openaiLogo from "@/assets/llm/openai.jpg";
import deepseekLogo from "@/assets/llm/deepseek.png";
import { TranslateService } from "@/types/model";

const TRANSLATE_SERVICES: Record<
  TranslateService,
  { logo: string; name: string }
> = {
  openai: {
    logo: openaiLogo,
    name: "OpenAI",
  },
  deepseek: {
    logo: deepseekLogo,
    name: "DeepSeek",
  },
};

export const TranslateServiceSelector = () => {
  const [translateService, setTranslateService] =
    useStorageState<TranslateService>("translateService", "openai");

  return (
    <div className="flex items-center gap-2 justify-between">
      <span className="font-medium text-[13px]">
        {i18n.t("translateService")}
      </span>
      <Select value={translateService} onValueChange={setTranslateService}>
        <SelectTrigger className="outline-none cursor-pointer bg-input/50 hover:bg-input w-30 h-7 pl-2.5 pr-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TRANSLATE_SERVICES).map(([value, { logo, name }]) => (
            <SelectItem key={value} value={value}>
              <TranslateItem logo={logo} name={name} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const TranslateItem = ({ logo, name }: { logo: string; name: string }) => {
  return (
    <div className="flex items-center gap-1.5">
      <img
        src={logo}
        alt={name}
        className="w-4 h-4 rounded-full border border-border bg-white"
      />
      {name}
    </div>
  );
};
