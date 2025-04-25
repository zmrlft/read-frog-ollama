import FloatingButton from "./components/FloatingButton";
import SideContent from "./components/SideContent";

export default function App() {
  return (
    <div
      className={cn(
        "text-base antialiased font-sans z-[2147483647]",
        isDarkMode() && "dark"
      )}
    >
      <div className="text-black dark:text-white">
        <FloatingButton />
        <SideContent />
      </div>
    </div>
  );
}
