import { Icon } from '@iconify/react'
import { cn } from '@repo/ui/lib/utils'
import { useAtomValue } from 'jotai'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { validateTranslationConfig } from '@/utils/host/translate/translate-text'
import { logger } from '@/utils/logger'
import { sendMessage } from '@/utils/message'
import { enablePageTranslationAtom } from '../../atoms'
import HiddenButton from './components/hidden-button'

export default function TranslateButton({ className }: { className: string }) {
  const enablePageTranslation = useAtomValue(enablePageTranslationAtom)
  const providersConfig = useAtomValue(configFieldsAtomMap.providersConfig)
  const translateConfig = useAtomValue(configFieldsAtomMap.translate)
  const languageConfig = useAtomValue(configFieldsAtomMap.language)

  return (
    <HiddenButton
      icon="ri:translate"
      className={className}
      onClick={() => {
        if (!enablePageTranslation) {
          if (!validateTranslationConfig({
            providersConfig,
            translate: translateConfig,
            language: languageConfig,
          })) {
            logger.error('validateTranslationConfig returned false; aborting enablePageTranslation')
            return
          }
          void sendMessage('setEnablePageTranslationOnContentScript', {
            enabled: true,
          })
        }
        else {
          void sendMessage('setEnablePageTranslationOnContentScript', {
            enabled: false,
          })
        }
      }}
    >
      <Icon
        icon="tabler:check"
        className={cn(
          'absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-green-500 text-white',
          enablePageTranslation ? 'block' : 'hidden',
        )}
      />
    </HiddenButton>
  )
}
