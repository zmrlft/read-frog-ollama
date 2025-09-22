import type { Config } from '@/types/config/config'
import { getFinalSourceCode } from '@/utils/config/languages'

export async function shouldEnableAutoTranslation(url: string, config: Config): Promise<boolean> {
  const autoTranslatePatterns = config?.translate.page.autoTranslatePatterns
  const autoTranslateLanguages = config?.translate.page.autoTranslateLanguages
  const { detectedCode, sourceCode } = config?.language || {}

  const doesMatchPattern = autoTranslatePatterns?.some(pattern =>
    url.toLowerCase().includes(pattern.toLowerCase()),
  ) ?? false

  const doesMatchLanguage = autoTranslateLanguages?.includes(getFinalSourceCode(sourceCode, detectedCode))

  return doesMatchPattern || doesMatchLanguage
}
