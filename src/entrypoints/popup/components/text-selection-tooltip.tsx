import { i18n } from '#imports'
import { Switch } from '@repo/ui/components/switch'
import { useAtom } from 'jotai'
import { useId } from 'react'
import { configFields } from '@/utils/atoms/config'

export default function SelectionToolbar() {
  const labelId = useId()
  const [selectionToolbar, setSelectionToolbar] = useAtom(
    configFields.selectionToolbar,
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <span id={labelId} className="text-[13px] font-medium">
        {i18n.t('popup.enabledSelectionToolbar')}
      </span>
      <Switch
        checked={selectionToolbar.enabled}
        aria-labelledby={labelId}
        onCheckedChange={(checked) => {
          setSelectionToolbar({ ...selectionToolbar, enabled: checked })
        }}
      />
    </div>
  )
}
