import { Button } from "@/components/ui/Button";
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/Tooltip";

import { RotateCcw } from "lucide-react";
import { shadowWrapper } from "../..";

export const Metadata = () => {
  const title = document.title ?? "Untitled";
  const favicon = getFaviconUrl();
  console.log("favicon", favicon);

  return (
    <div className="relative flex justify-between items-center">
      <div className="flex items-center gap-x-2 flex-1 min-w-0">
        <img src={favicon} alt="Favicon" className="w-4 h-4 flex-shrink-0" />
        <h1 className="text-lg font-bold truncate">{title}</h1>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="iconSm">
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent container={shadowWrapper} side="left">
          <p>Regenerate</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
