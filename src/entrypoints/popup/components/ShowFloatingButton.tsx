import { Switch } from "@/components/ui/Switch";

export const ShowFloatingButton = () => {
  const [showFloatingButton, setShowFloatingButton] = useStorageState<boolean>(
    "showFloatingButton",
    false
  );

  console.log("showFloatingButton", showFloatingButton);

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-medium text-[13px]">
        {i18n.t("popup.showFloatingButton")}
      </span>
      <Switch
        checked={showFloatingButton}
        onCheckedChange={setShowFloatingButton}
      />
    </div>
  );
};
