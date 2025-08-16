import { Icon } from '@iconify/react'
import { cn } from '@repo/ui/lib/utils'
import { useAtomValue } from 'jotai'
import { configFields } from '@/utils/atoms/config'
import { removeAllTranslatedWrapperNodes } from '@/utils/host/translate/node-manipulation'
import { validateTranslationConfig } from '@/utils/host/translate/translate-text'
import { sendMessage } from '@/utils/message'
import { enablePageTranslationAtom, isDraggingButtonAtom } from '../../atoms'
import HiddenButton from './components/hidden-button'

export default function TranslateButton() {
  const enablePageTranslation = useAtomValue(enablePageTranslationAtom)
  const providersConfig = useAtomValue(configFields.providersConfig)
  const translateConfig = useAtomValue(configFields.translate)
  const languageConfig = useAtomValue(configFields.language)
  const isDraggingButton = useAtomValue(isDraggingButtonAtom)

  return (
    <HiddenButton
      icon="ri:translate"
      className={(isDraggingButton ? 'translate-x-0' : '')}
      onClick={() => {
        if (!enablePageTranslation) {
          if (!validateTranslationConfig({
            providersConfig,
            translate: translateConfig,
            language: languageConfig,
          })) {
            return
          }
          sendMessage('setEnablePageTranslationOnContentScript', {
            enabled: true,
          })
        }
        else {
          removeAllTranslatedWrapperNodes()
          sendMessage('setEnablePageTranslationOnContentScript', {
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
