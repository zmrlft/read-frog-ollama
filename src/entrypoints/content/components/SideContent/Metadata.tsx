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

  return (
    <div className="relative flex justify-between items-center">
      <div className="flex items-center gap-x-2">
        <img src={favicon} alt="Favicon" className="w-4 h-4" />
        <h1 className="text-lg font-bold truncate">{title}</h1>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="iconSm">
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent container={shadowWrapper}>
          <p>Refresh</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
