import { browser, i18n } from '#imports'
import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import { useAtom, useAtomValue } from 'jotai'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { validateTranslationConfig } from '@/utils/host/translate/translate-text'
import { sendMessage } from '@/utils/message'
import { formatHotkey } from '@/utils/os.ts'
import { isPageTranslatedAtom } from '../atoms/auto-translate'
import { isIgnoreTabAtom } from '../atoms/ignore'

export default function TranslateButton({ className }: { className?: string }) {
  const [isPageTranslated, setIsPageTranslated] = useAtom(isPageTranslatedAtom)
  const isIgnoreTab = useAtomValue(isIgnoreTabAtom)
  const providersConfig = useAtomValue(configFieldsAtomMap.providersConfig)
  const translateConfig = useAtomValue(configFieldsAtomMap.translate)
  const languageConfig = useAtomValue(configFieldsAtomMap.language)

  const toggleTranslation = async () => {
    const [currentTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })

    if (currentTab.id) {
      if (!isPageTranslated && !validateTranslationConfig({
        providersConfig,
        translate: translateConfig,
        language: languageConfig,
      })) {
        return
      }

      void sendMessage('setEnablePageTranslation', {
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
