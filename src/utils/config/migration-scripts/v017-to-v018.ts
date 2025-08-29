import { DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY } from '@/utils/constants/translate'

export function migrate(oldConfig: any): any {
  return {
    ...oldConfig,
    translate: {
      ...oldConfig.translate,
      customAutoTranslateShortcutKey: DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY,
    },
  }
}
