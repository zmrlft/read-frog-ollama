import type { PageTranslationManager } from './page-translation'
import hotkeys from 'hotkeys-js'
import { globalConfig } from '@/utils/config/config'
import { validateTranslationConfig } from '@/utils/host/translate/translate-text'

interface ITranslationShortcutKeyManager {
  bindTranslationShortcutKey: () => void
}

export class TranslationShortcutKeyManager implements ITranslationShortcutKeyManager {
  private pageTranslationManager: PageTranslationManager
  private bindingAutoTranslationShortcutKey: string = ''

  constructor({ pageTranslationManager }: { pageTranslationManager: PageTranslationManager }) {
    this.pageTranslationManager = pageTranslationManager
  }

  bindTranslationShortcutKey() {
    this.bindAutoTranslationShortcutKey()
  }

  private bindAutoTranslationShortcutKey() {
    if (!globalConfig)
      return

    hotkeys.unbind(this.bindingAutoTranslationShortcutKey)

    this.bindingAutoTranslationShortcutKey = globalConfig.translate.customAutoTranslateShortcutKey.join('+')

    hotkeys(this.bindingAutoTranslationShortcutKey, () => {
      if (!globalConfig)
        return

      if (this.pageTranslationManager.isActive) {
        this.pageTranslationManager.stop()
      }
      else {
        if (!validateTranslationConfig({
          providersConfig: globalConfig.providersConfig,
          translate: globalConfig.translate,
          language: globalConfig.language,
        })) {
          return
        }
        this.pageTranslationManager.start()
      }
      return false
    })
  }
}
