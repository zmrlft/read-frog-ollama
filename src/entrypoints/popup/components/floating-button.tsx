import { i18n } from '#imports'
import { Switch } from '@repo/ui/components/switch'
import { useAtom } from 'jotai'
import { configFields } from '@/utils/atoms/config'

export default function FloatingButton() {
  const [floatingButton, setFloatingButton] = useAtom(
    configFields.floatingButton,
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium">
        {i18n.t('popup.enabledFloatingButton')}
      </span>
      <Switch
        checked={floatingButton.enabled}
        onCheckedChange={(checked) => {
          setFloatingButton({ enabled: checked })
        }}
      />
    </div>
  )
}
