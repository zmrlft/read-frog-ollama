import type { PageTranslationManager } from './page-translation'
import hotkeys from 'hotkeys-js'
import { getConfigFromStorage } from '@/utils/config/config'
import { validateTranslationConfig } from '@/utils/host/translate/translate-text'

export async function bindTranslationShortcutKey(pageTranslationManager: PageTranslationManager) {
  // Clear all existing hotkeys first
  hotkeys.unbind()

  const config = await getConfigFromStorage()
  if (!config)
    return

  const shortcutKey = config.translate.customAutoTranslateShortcutKey.join('+')

  hotkeys(shortcutKey, () => {
    void (async () => {
      const currentConfig = await getConfigFromStorage()
      if (!currentConfig)
        return

      if (pageTranslationManager.isActive) {
        pageTranslationManager.stop()
      }
      else {
        if (!validateTranslationConfig({
          providersConfig: currentConfig.providersConfig,
          translate: currentConfig.translate,
          language: currentConfig.language,
        })) {
          return
        }
        void pageTranslationManager.start()
      }
    })()
    return false
  })
}
