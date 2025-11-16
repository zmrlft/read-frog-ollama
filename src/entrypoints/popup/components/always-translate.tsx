import { i18n } from '#imports'
import { Switch } from '@read-frog/ui/components/switch'
import { useAtom, useAtomValue } from 'jotai'
import { isCurrentSiteInPatternsAtom, toggleCurrentSiteAtom } from '../atoms/auto-translate'
import { isIgnoreTabAtom } from '../atoms/ignore'

export function AlwaysTranslate() {
  const isCurrentSiteInPatterns = useAtomValue(isCurrentSiteInPatternsAtom)
  const [, toggleCurrentSite] = useAtom(toggleCurrentSiteAtom)
  const isIgnoreTab = useAtomValue(isIgnoreTabAtom)

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium">
        {i18n.t('popup.alwaysTranslate')}
      </span>
      <Switch
        checked={isCurrentSiteInPatterns}
        onCheckedChange={toggleCurrentSite}
        disabled={isIgnoreTab}
      />
    </div>
  )
}
