import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Select } from "@/components/ui/Select";
import { Provider } from "@/types/provider";

export const ProviderSelector = () => {
  const [provider, setProvider] = useStorageState<Provider>(
    "provider",
    "openai"
  );

  return (
    <div className="flex items-center gap-2 justify-between">
      <span className="font-medium text-[13px]">
        {i18n.t("translateService")}
      </span>
      <Select value={provider} onValueChange={setProvider}>
        <SelectTrigger className="outline-none cursor-pointer bg-input/50 hover:bg-input w-30 !h-7 pl-2.5 pr-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(providerItems).map(([value, { logo, name }]) => (
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
