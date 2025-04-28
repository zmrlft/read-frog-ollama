import { Input } from "@/components/ui/Input";
import openaiLogo from "@/assets/llm/openai.jpg";
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

function App() {
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useStorageState<string>(
    "openaiApiKey",
    ""
  );
  const [isCustomOpenAIModel, setIsCustomOpenAIModel] =
    useStorageState<boolean>("isCustomOpenAIModel", false);
  const [openAIModel, setOpenAIModel] = useStorageState<string>(
    "openAIModel",
    "gpt-4.1-mini"
  );

  return (
    <div className="max-w-[320px] mx-auto min-h-[100vh] my-10">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img
          src={openaiLogo}
          alt="OpenAI"
          className="w-6 h-6 rounded-full border border-border"
        />
        <span className="font-medium">OpenAI Config</span>
      </div>
      <div className="text-sm font-medium">API Key</div>
      <Input
        className="mt-1 mb-2"
        value={openaiApiKey}
        type={showAPIKey ? "text" : "password"}
        onChange={(e) => setOpenaiApiKey(e.target.value)}
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
      {isCustomOpenAIModel ? (
        <Input
          className="mt-1 mb-2"
          value={openAIModel}
          onChange={(e) => setOpenAIModel(e.target.value)}
        />
      ) : (
        <Select
          value={openAIModel}
          onValueChange={(value) => setOpenAIModel(value)}
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
              <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
              <SelectItem value="gpt-4o">gpt-4o</SelectItem>
              <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
              <SelectItem value="gpt-4.1-nano">gpt-4.1-nano</SelectItem>
              <SelectItem value="gpt-4.5-preview">gpt-4.5-preview</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      <div className="flex items-center space-x-2 mt-2">
        <Checkbox
          id="isCustomOpenAIModel"
          checked={isCustomOpenAIModel}
          onCheckedChange={(checked) => {
            if (checked === false) setOpenAIModel("gpt-4.1-mini");
            setIsCustomOpenAIModel(checked === true);
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
}

export default App;
