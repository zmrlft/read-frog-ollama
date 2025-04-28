import { useAtom, useAtomValue } from "jotai";
import { isSideOpenAtom, sideContentWidthAtom } from "../atoms";
import { DEFAULT_BUTTON_POSITION } from "../../../utils/constants/side";
import readBuddyLogo from "@/assets/read-buddy.png";

export default function FloatingButton() {
  const [showFloatingButton, _setShowFloatingButton] = useStorageState<boolean>(
    "showFloatingButton",
    false
  );
  const [isSideOpen, setIsSideOpen] = useAtom(isSideOpenAtom);
  const sideContentWidth = useAtomValue(sideContentWidthAtom);
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<number | null>(null);

  useEffect(() => {
    let unwatch: () => void;

    const loadWidth = async () => {
      const position = await storage.getItem<number>(
        "local:readBuddy_buttonPosition"
      );

      if (position) {
        setButtonPosition(position);
      } else {
        setButtonPosition(DEFAULT_BUTTON_POSITION);
      }

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
    showFloatingButton &&
    buttonPosition && (
      <div
        className={cn(
          "fixed w-14 h-9 rounded-l-full flex items-center shadow-lg hover:translate-x-0 translate-x-5 transition-transform duration-300 z-[2147483647]",
          "dark:bg-neutral-900 border-border bg-neutral-100 border border-r-0 opacity-80 hover:opacity-100",
          isSideOpen && "opacity-100",
          isDraggingButton ? "cursor-move" : "cursor-pointer"
        )}
        style={{
          right: isSideOpen ? `${sideContentWidth}px` : "0",
          top: `${buttonPosition}vh`,
        }}
        onMouseDown={handleButtonDragStart}
      >
        <img
          src={readBuddyLogo}
          alt="Read Buddy"
          className="ml-[5px] w-7 h-7"
        />
        <div className="absolute inset-0 opacity-0"></div>
      </div>
    )
  );
}
