import { useState, useEffect } from "react";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.marginRight = isOpen ? "16rem" : "";
  }, [open]);

  return (
    <div>
      <div className="text-red-500 fixed top-0 right-0 z-[9998] h-full translate-x-full transform bg-zinc-700 shadow-xl transition-transform duration-300">
        123
      </div>
      {/* 小球按钮 */}
      <button
        className="fixed right-4 bottom-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg z-[9999]"
        onClick={() => setIsOpen((o) => !o)}
      >
        💬
      </button>
      {/* 侧边栏 */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-white shadow-xl z-[9998]
          transform transition-transform duration-300
          ${
            isOpen
              ? "w-64 translate-x-0 text-green-500"
              : "w-64 translate-x-full text-red-500"
          }
        `}
      >
        <h2 className="p-4 text-lg font-semibold border-b">Side Chat</h2>
        {/* 这里放你的聊天组件或其它内容 */}
      </div>
    </div>
  );
}
