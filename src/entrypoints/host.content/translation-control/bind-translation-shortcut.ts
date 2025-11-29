import type { PageTranslationManager } from './page-translation'
import hotkeys from 'hotkeys-js'
import { getConfigFromStorage } from '@/utils/config/config'

export async function bindTranslationShortcutKey(pageTranslationManager: PageTranslationManager) {
  // Clear all existing hotkeys first
  hotkeys.unbind()

  const config = await getConfigFromStorage()
  if (!config)
    return

  const shortcut = config.translate.page.shortcut.join('+')

  hotkeys(shortcut, () => {
    void (async () => {
      const currentConfig = await getConfigFromStorage()
      if (!currentConfig)
        return

      if (pageTranslationManager.isActive) {
        pageTranslationManager.stop()
      }
      else {
        void pageTranslationManager.start()
      }
    })()
    return false
  })
}
