import { useState, useEffect, useRef } from "react";
import { storage } from "#imports";

const MIN_SIDE_CONTENT_WIDTH = 300;
const DEFAULT_SIDE_CONTENT_WIDTH = 400;
const DEFAULT_BUTTON_POSITION = 50; // 默认按钮位置（屏幕高度百分比）

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [sideContentWidth, setSideContentWidth] = useState(
    DEFAULT_SIDE_CONTENT_WIDTH
  );
  const [isResizing, setIsResizing] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(DEFAULT_BUTTON_POSITION); // 按钮位置（百分比）
  const [isDraggingButton, setIsDraggingButton] = useState(false);

  useEffect(() => {
    let sideContentWidthUnwatch: () => void;

    const loadWidth = async () => {
      const width = await storage.getItem<number>(
        "local:readBuddy_sideContentWidth"
      );
      if (width) setSideContentWidth(width);

      // 加载按钮位置
      const position = await storage.getItem<number>(
        "local:readBuddy_buttonPosition"
      );
      if (position) setButtonPosition(position);

      sideContentWidthUnwatch = await storage.watch<number>(
        "local:readBuddy_sideContentWidth",
        (newWidth, _oldWidth) => {
          if (newWidth) setSideContentWidth(newWidth);
        }
      );
    };
    loadWidth();

    return () => {
      sideContentWidthUnwatch?.();
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

  // 保存按钮位置
  useEffect(() => {
    const savePosition = async () => {
      await storage.setItem<number>(
        "local:readBuddy_buttonPosition",
        buttonPosition
      );
    };

    savePosition();
  }, [buttonPosition]);

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

  // 按钮拖动处理
  useEffect(() => {
    if (!isDraggingButton) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingButton) return;

      // 计算新位置 (百分比)
      const windowHeight = window.innerHeight;
      const clampedY = Math.max(30, Math.min(windowHeight - 100, e.clientY));
      const newPosition = (clampedY / windowHeight) * 100;
      // 限制在5%到95%之间

      setButtonPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDraggingButton(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDraggingButton]);

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
    setIsResizing(true);
  };

  const handleButtonDragStart = (e: React.MouseEvent) => {
    // 记录初始位置，用于后续判断是点击还是拖动
    const initialY = e.clientY;
    let hasMoved = false; // 标记是否发生了移动

    e.preventDefault();
    setIsDraggingButton(true);

    // 创建一个监听器检测移动
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const moveDistance = Math.abs(moveEvent.clientY - initialY);
      // 如果移动距离大于阈值，标记为已移动
      if (moveDistance > 5) {
        hasMoved = true;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    // 在鼠标释放时，只有未移动才触发点击事件
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // 只有未移动过才触发点击
      if (!hasMoved) {
        setIsOpen((o) => !o);
      }
    };

    document.addEventListener("mouseup", handleMouseUp, { once: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  };

  return (
    <>
      <div
        className={cn(
          "fixed w-14 h-9 rounded-l-full flex items-center shadow-lg hover:translate-x-0 translate-x-5 transition-transform duration-300 z-[2147483647]",
          "bg-gradient-to-br from-amber-200 to-amber-400 opacity-50 hover:opacity-100",
          isOpen && "opacity-100",
          isDraggingButton ? "cursor-move" : "cursor-pointer"
        )}
        style={{
          right: isOpen ? `${sideContentWidth}px` : "0",
          top: `${buttonPosition}vh`,
        }}
        onMouseDown={handleButtonDragStart}
      >
        <span className="ml-2.5 text-xl">🤖</span>
        <div className="absolute inset-0 opacity-0" title="拖动改变位置"></div>
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
          <div className="mt-4 cursor-pointer">123</div>
        </div>
      </div>

      {/* Transparent overlay to prevent other events during resizing */}
      {isResizing && (
        <div className="fixed inset-0 bg-transparent z-[2147483647] cursor-ew-resize" />
      )}
    </>
  );
}
