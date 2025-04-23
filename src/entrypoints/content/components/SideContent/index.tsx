import { sideContentWidthAtom } from "../../atoms";
import { useAtom, useAtomValue } from "jotai";
import { isSideOpenAtom } from "../../atoms";
import { MIN_SIDE_CONTENT_WIDTH } from "../../constants";
import Content from "./Content";
import { Button } from "@/components/ui/Button";

export default function SideContent() {
  const isSideOpen = useAtomValue(isSideOpenAtom);
  const [sideContentWidth, setSideContentWidth] = useAtom(sideContentWidthAtom);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let unwatch: () => void;

    const loadWidth = async () => {
      const width = await storage.getItem<number>(
        "local:readBuddy_sideContentWidth"
      );
      if (width) setSideContentWidth(width);

      unwatch = await storage.watch<number>(
        "local:readBuddy_sideContentWidth",
        (newWidth, _oldWidth) => {
          if (newWidth) setSideContentWidth(newWidth);
        }
      );
    };
    loadWidth();

    return () => {
      unwatch?.();
    };
  }, []);

  useEffect(() => {
    const saveWidth = async () => {
      await storage.setItem<number>(
        "local:readBuddy_sideContentWidth",
        sideContentWidth
      );
    };

    saveWidth();
  }, [sideContentWidth]);

  // Setup resize handlers
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const windowWidth = window.innerWidth;
      const newWidth = windowWidth - e.clientX;
      const clampedWidth = Math.max(MIN_SIDE_CONTENT_WIDTH, newWidth);

      setSideContentWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // HTML width adjustment
  useEffect(() => {
    const styleId = "read-buddy-style-right-space";
    let styleTag = document.getElementById(styleId);

    if (isSideOpen) {
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = `
        html {
          width: calc(100% - ${sideContentWidth}px) !important;
          position: relative !important;
          min-height: 100vh !important;
        }
      `;
    } else {
      if (styleTag) {
        document.head.removeChild(styleTag);
      }
    }

    return () => {
      if (styleTag && document.head.contains(styleTag)) {
        document.head.removeChild(styleTag);
      }
    };
  }, [isSideOpen, sideContentWidth]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <>
      <div
        className={cn(
          "fixed top-0 right-0 p-2 bg-background h-full shadow-xl z-[2147483647]",
          isSideOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          width: `${sideContentWidth}px`,
        }}
      >
        {/* Resize handle */}
        <div
          className="absolute left-0 top-0 w-2 h-full justify-center bg-transparent cursor-ew-resize z-10"
          onMouseDown={handleResizeStart}
        ></div>

        <div className="absolute top-0 left-2 h-full border-r border-border border-dashed" />
        <div className="absolute top-0 right-2 h-full border-r border-border border-dashed" />
        <div className="absolute top-2 left-0 w-full border-b border-border border-dashed" />
        <div className="absolute bottom-2 left-0 w-full border-b border-border border-dashed" />

        {/* Sidebar content */}
        <div className="h-full border flex flex-col border-border">
          <div className="border-b border-border flex justify-end">
            <Button
              variant="outline"
              className="border-l border-r-0 border-t-0 border-b-0"
            >
              Config API Key
            </Button>
          </div>
          <Content />
        </div>
      </div>

      {/* Transparent overlay to prevent other events during resizing */}
      {isResizing && (
        <div className="fixed inset-0 bg-transparent z-[2147483647] cursor-ew-resize" />
      )}
    </>
  );
}
