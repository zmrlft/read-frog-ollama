import type { LangCodeISO6393 } from '@read-frog/definitions'
import type { Config } from '@/types/config/config'
import { z } from 'zod'
import { getFinalSourceCode } from '@/utils/config/languages'

export function matchDomainPattern(url: string, pattern: string): boolean {
  if (!z.url().safeParse(url).success) {
    return false
  }

  const urlObj = new URL(url)
  const hostname = urlObj.hostname.toLowerCase()
  const patternLower = pattern.toLowerCase().trim()

  if (hostname === patternLower) {
    return true
  }

  if (hostname.endsWith(`.${patternLower}`)) {
    return true
  }

  return false
}

export async function shouldEnableAutoTranslation(url: string, detectedCodeOrUnd: LangCodeISO6393 | 'und', config: Config): Promise<boolean> {
  const autoTranslatePatterns = config?.translate.page.autoTranslatePatterns
  const autoTranslateLanguages = config?.translate.page.autoTranslateLanguages
  const { sourceCode } = config?.language || {}

  const doesMatchPattern = autoTranslatePatterns?.some(pattern =>
    matchDomainPattern(url, pattern),
  ) ?? false

  let doesMatchLanguage = false
  if (detectedCodeOrUnd !== 'und') {
    doesMatchLanguage = autoTranslateLanguages?.includes(getFinalSourceCode(sourceCode, detectedCodeOrUnd))
  }

  return doesMatchPattern || doesMatchLanguage
}
