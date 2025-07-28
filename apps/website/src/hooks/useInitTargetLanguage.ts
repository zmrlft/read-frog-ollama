'use client'

import type { LangCodeISO6393 } from '@/types/languages'
import { useLocale } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { LOCALE_TO_ISO6393 } from '@/types/languages'

export function useInitTargetLanguage(): [
  LangCodeISO6393,
  (lang: LangCodeISO6393) => void,
] {
  const locale = useLocale()

  const [overrideLanguage, setOverrideLanguage] = useState<LangCodeISO6393 | undefined>(undefined)

  const websiteLanguage = useMemo<LangCodeISO6393>(() => {
    return LOCALE_TO_ISO6393[locale] ?? 'eng'
  }, [locale])

  const current = overrideLanguage ?? websiteLanguage

  useEffect(() => {
    window.postMessage(
      { source: 'read-frog-page', type: 'setTargetLanguage', langCodeISO6393: current },
      '*',
    )
  }, [current])

  const update = (lang: LangCodeISO6393) => {
    setOverrideLanguage(lang)
  }

  return [current, update]
}
