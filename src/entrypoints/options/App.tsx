import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectGroup,
  SelectItem,
} from "@/components/ui/Select";
import { useState } from "react";
import { useStorageState } from "@/hooks/useStorageState";
import {
  Provider,
  ProviderConfig,
  providerModels,
  providers,
} from "@/types/provider";

function App() {
  return (
    <div className="max-w-[320px] mx-auto min-h-[100vh] my-10 flex flex-col gap-12">
      {providers.map((provider) => (
        <ProviderConfigSection key={provider} provider={provider} />
      ))}
    </div>
  );
}

const ProviderConfigSection = ({ provider }: { provider: Provider }) => {
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [providerConfig, setProviderConfig] = useStorageState<ProviderConfig>(
    "providerConfig",
    defaultProviderConfig
  );

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-4">
        <img
          src={providerItems[provider].logo}
          alt={providerItems[provider].name}
          className="w-6 h-6 rounded-full border border-border bg-white"
        />
        <span className="font-medium">
          {providerItems[provider].name} Config
        </span>
      </div>
      <div className="text-sm font-medium">API Key</div>
      <Input
        className="mt-1 mb-2"
        value={providerConfig[provider].apiKey}
        type={showAPIKey ? "text" : "password"}
        onChange={(e) =>
          setProviderConfig({
            ...providerConfig,
            [provider]: { ...providerConfig[provider], apiKey: e.target.value },
          })
        }
      />
      <div className="flex items-center space-x-2">
        <Checkbox
          id="apiKey"
          checked={showAPIKey}
          onCheckedChange={(checked) => setShowAPIKey(checked === true)}
        />
        <label
          htmlFor="apiKey"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show API Key
        </label>
      </div>
      <div className="text-sm font-medium mt-4">Model</div>
      {providerConfig[provider].isCustomModel ? (
        <Input
          className="mt-1 mb-2"
          value={providerConfig[provider].model}
          onChange={(e) =>
            setProviderConfig({
              ...providerConfig,
              [provider]: {
                ...providerConfig[provider],
                model: e.target.value,
              },
            })
          }
        />
      ) : (
        <Select
          value={providerConfig[provider].model}
          onValueChange={(value) =>
            setProviderConfig({
              ...providerConfig,
              [provider]: { ...providerConfig[provider], model: value },
            })
          }
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {providerModels[provider].map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      <div className="flex items-center space-x-2 mt-2">
        <Checkbox
          id="isCustomOpenAIModel"
          checked={providerConfig[provider].isCustomModel}
          onCheckedChange={(checked) => {
            if (checked === false)
              setProviderConfig({
                ...providerConfig,
                [provider]: {
                  ...providerConfig[provider],
                  model: defaultProviderConfig[provider].model,
                  isCustomModel: false,
                },
              });
            setProviderConfig({
              ...providerConfig,
              [provider]: {
                ...providerConfig[provider],
                isCustomModel: checked === true,
              },
            });
          }}
        />
        <label
          htmlFor="isCustomOpenAIModel"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Enter the name of the custom model
        </label>
      </div>
    </div>
  );
};

export default App;
