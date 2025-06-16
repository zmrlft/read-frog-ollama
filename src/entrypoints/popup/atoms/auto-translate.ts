import type { Config } from '@/types/config/config'
import { atom } from 'jotai'
import { configFields } from '@/utils/atoms/config'
import { getActiveTabUrl } from '@/utils/utils'

type TranslateConfig = Config['translate']

// Sync atom to store the checked state
export const isCurrentSiteInPatternsAtom = atom<boolean>(false)

export async function getIsInPatterns(translateConfig: TranslateConfig) {
  const activeTabUrl = await getActiveTabUrl()
  if (!activeTabUrl)
    return false
  return translateConfig.page.autoTranslatePatterns.some(pattern =>
    activeTabUrl.includes(pattern),
  )
}

// Async atom to initialize the checked state
export const initIsCurrentSiteInPatternsAtom = atom(
  null,
  async (get, set) => {
    const translateConfig = get(configFields.translate)
    set(isCurrentSiteInPatternsAtom, await getIsInPatterns(translateConfig))
  },
)

// Atom to toggle current site in auto-translate patterns
export const toggleCurrentSiteAtom = atom(
  null,
  async (get, set, checked: boolean) => {
    const translateConfig = get(configFields.translate)
    const activeTabUrl = await getActiveTabUrl()

    if (!activeTabUrl)
      return

    const currentPatterns = translateConfig.page.autoTranslatePatterns
    const hostname = new URL(activeTabUrl).hostname

    if (checked) {
      // Add hostname to patterns if not already present
      if (!currentPatterns.some(pattern => hostname.includes(pattern))) {
        set(configFields.translate, {
          page: {
            ...translateConfig.page,
            autoTranslatePatterns: [...currentPatterns, hostname],
          },
        })
      }
    }
    else {
      // Remove patterns that match the current hostname
      const filteredPatterns = currentPatterns.filter(pattern =>
        !hostname.includes(pattern),
      )
      set(configFields.translate, {
        page: {
          ...translateConfig.page,
          autoTranslatePatterns: filteredPatterns,
        },
      })
    }

    // Update the local state
    set(isCurrentSiteInPatternsAtom, checked)
  },
)

export const isPageTranslatedAtom = atom<boolean>(false)
