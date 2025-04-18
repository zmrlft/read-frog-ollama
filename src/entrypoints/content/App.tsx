import { useState, useEffect, useRef } from "react";
import { storage } from "#imports";

const MIN_SIDE_CONTENT_WIDTH = 200;
const DEFAULT_SIDE_CONTENT_WIDTH = 256;

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [sideContentWidth, setSideContentWidth] = useState(
    DEFAULT_SIDE_CONTENT_WIDTH
  );
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

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
      unwatch();
    };
  }, []);

  useEffect(() => {
    const saveWidth = async () => {
      await storage.setItem<number>(
        "local:readBuddy_sideContentWidth",
        sideContentWidth
      );

      console.log(
        "Width saved",
        await storage.getItem<number>("local:readBuddy_sideContentWidth")
      );
    };

    saveWidth();
  }, [sideContentWidth]);

  // Setup resize handlers
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = startXRef.current - e.clientX;
      const newWidth = startWidthRef.current + deltaX;
      const clampedWidth = Math.max(MIN_SIDE_CONTENT_WIDTH, newWidth);

      setSideContentWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // HTML width adjustment
  useEffect(() => {
    const styleId = "read-buddy-style-right-space";
    let styleTag = document.getElementById(styleId);

    if (isOpen) {
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
  }, [isOpen, sideContentWidth]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = sideContentWidth;
    setIsResizing(true);
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-10 w-14 h-9 rounded-l-full flex items-center shadow-lg bg-amber-500 opacity-50 hover:opacity-100 hover:translate-x-0 translate-x-5 transition-transform duration-300 z-[2147483647]",
          isOpen && "opacity-100"
        )}
        style={{
          right: isOpen ? `${sideContentWidth}px` : "0",
        }}
        onClick={() => setIsOpen((o) => !o)}
      >
        <span className="ml-3">💬</span>
      </div>

      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-white shadow-xl z-[2147483647]",
          isOpen ? "translate-x-0" : "translate-x-full"
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

        {/* Sidebar content */}
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold border-b pb-2">Side Chat</h2>
          {/* Here goes the chat content */}
        </div>
      </div>

      {/* Transparent overlay to prevent other events during resizing */}
      {isResizing && (
        <div className="fixed inset-0 bg-transparent z-[2147483647]" />
      )}
    </>
  );
}
