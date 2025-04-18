import { useState, useEffect, useRef } from "react";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default width: 16rem/256px
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const STORAGE_KEY = "readBuddy_sidebarWidth";

  // Load saved width on mount
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem(STORAGE_KEY);
      if (savedWidth) {
        setSidebarWidth(parseInt(savedWidth, 10));
      }
    } catch (e) {
      console.error("Failed to load sidebar width from localStorage", e);
    }
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setSidebarWidth(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save width when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, sidebarWidth.toString());
    } catch (e) {
      console.error("Failed to save sidebar width to localStorage", e);
    }
  }, [sidebarWidth]);

  // Setup resize handlers
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Calcular el nuevo ancho en función del desplazamiento del mouse
      const deltaX = startXRef.current - e.clientX;
      const newWidth = startWidthRef.current + deltaX;

      // Limitar el ancho entre 200px y 600px
      const clampedWidth = Math.max(200, Math.min(600, newWidth));

      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    // Añadir los oyentes de eventos mientras se está redimensionando
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cambiar el cursor para toda la página durante el redimensionamiento
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    // Limpieza
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // HTML width adjustment
  useEffect(() => {
    const styleId = "monica-style-right-space";
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;

    if (isOpen) {
      // Create style if it doesn't exist
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }

      // Set the style content with dynamic width
      styleTag.textContent = `
        html {
          width: calc(100% - ${sidebarWidth}px) !important;
          position: relative !important;
          min-height: 100vh !important;
        }
      `;
    } else {
      // Remove style if it exists
      if (styleTag) {
        document.head.removeChild(styleTag);
      }
    }

    // Cleanup function
    return () => {
      if (styleTag && document.head.contains(styleTag)) {
        document.head.removeChild(styleTag);
      }
    };
  }, [isOpen, sidebarWidth]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    setIsResizing(true);
  };

  return (
    <div>
      <div
        className={cn(
          "fixed bottom-10 w-14 h-9 rounded-l-full flex items-center shadow-lg bg-amber-500 opacity-50 hover:opacity-100 z-[9980] hover:translate-x-0 translate-x-5 transition-transform duration-300",
          isOpen && "opacity-100"
        )}
        style={{
          right: isOpen ? `${sidebarWidth}px` : "0",
        }}
        onClick={() => setIsOpen((o) => !o)}
      >
        <span className="ml-3">💬</span>
      </div>

      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 right-0 h-full bg-white shadow-xl z-[9990]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          width: `${sidebarWidth}px`,
        }}
      >
        {/* Resize handle */}
        <div
          className="absolute left-0 top-0 w-2 h-full flex items-center justify-center hover:bg-blue-100 cursor-ew-resize z-10"
          onMouseDown={handleResizeStart}
        ></div>

        {/* Sidebar content */}
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold border-b pb-2">Side Chat</h2>
          {/* Here goes the chat content */}
        </div>
      </div>

      {/* Transparent overlay to prevent other events during resizing */}
      {isResizing && <div className="fixed inset-0 bg-transparent z-[9999]" />}
    </div>
  );
}
