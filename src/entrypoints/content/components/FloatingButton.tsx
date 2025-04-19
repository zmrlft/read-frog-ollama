import { useAtom, useAtomValue } from "jotai";
import { isSideOpenAtom, sideContentWidthAtom } from "../atoms";
import { DEFAULT_BUTTON_POSITION } from "../constants";

export default function FloatingButton() {
  const [isSideOpen, setIsSideOpen] = useAtom(isSideOpenAtom);
  const sideContentWidth = useAtomValue(sideContentWidthAtom);
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(DEFAULT_BUTTON_POSITION);

  useEffect(() => {
    let unwatch: () => void;

    const loadWidth = async () => {
      const width = await storage.getItem<number>(
        "local:readBuddy_buttonPosition"
      );
      if (width) setButtonPosition(width);

      unwatch = await storage.watch<number>(
        "local:readBuddy_buttonPosition",
        (newPosition, _oldPosition) => {
          if (newPosition) setButtonPosition(newPosition);
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
        "local:readBuddy_buttonPosition",
        buttonPosition
      );
    };

    saveWidth();
  }, [buttonPosition]);

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
        setIsSideOpen((o) => !o);
      }
    };

    document.addEventListener("mouseup", handleMouseUp, { once: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  };

  return (
    <div
      className={cn(
        "fixed w-14 h-9 rounded-l-full flex items-center shadow-lg hover:translate-x-0 translate-x-5 transition-transform duration-300 z-[2147483647]",
        "bg-[linear-gradient(to_bottom_right,#fde68a,#fbbf24)] opacity-50 hover:opacity-100",
        isSideOpen && "opacity-100",
        isDraggingButton ? "cursor-move" : "cursor-pointer"
      )}
      style={{
        right: isSideOpen ? `${sideContentWidth}px` : "0",
        top: `${buttonPosition}vh`,
      }}
      onMouseDown={handleButtonDragStart}
    >
      <span className="ml-2.5 text-xl">🤖</span>
      <div className="absolute inset-0 opacity-0" title="拖动改变位置"></div>
    </div>
  );
}
