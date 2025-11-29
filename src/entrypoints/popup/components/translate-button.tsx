import { browser, i18n } from '#imports'
import { useAtom, useAtomValue } from 'jotai'
import { Button } from '@/components/shadcn/button'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { sendMessage } from '@/utils/message'
import { formatHotkey } from '@/utils/os.ts'
import { cn } from '@/utils/styles/tailwind'
import { isPageTranslatedAtom } from '../atoms/auto-translate'
import { isIgnoreTabAtom } from '../atoms/ignore'

export default function TranslateButton({ className }: { className?: string }) {
  const [isPageTranslated, setIsPageTranslated] = useAtom(isPageTranslatedAtom)
  const isIgnoreTab = useAtomValue(isIgnoreTabAtom)
  const translateConfig = useAtomValue(configFieldsAtomMap.translate)

  const toggleTranslation = async () => {
    const [currentTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })

    if (currentTab.id) {
      void sendMessage('tryToSetEnablePageTranslationByTabId', {
        tabId: currentTab.id,
        enabled: !isPageTranslated,
      })

      setIsPageTranslated(prev => !prev)
    }
  }

  return (
    <Button
      onClick={toggleTranslation}
      disabled={isIgnoreTab}
      className={cn(
        'block truncate',
        className,
      )}
    >
      {isPageTranslated
        ? i18n.t('popup.showOriginal')
        : `${i18n.t('popup.translate')} (${formatHotkey(translateConfig.page.shortcut)})`}
    </Button>
  )
}
