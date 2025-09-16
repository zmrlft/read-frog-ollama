import { atom } from 'jotai'
import { configFields } from '@/utils/atoms/config'
import { getAPIProvidersConfig } from '@/utils/config/helpers'

const internalSelectedProviderIdAtom = atom<string | undefined>(undefined)

export const selectedProviderIdAtom = atom(
  (get) => {
    const selected = get(internalSelectedProviderIdAtom)
    if (selected !== undefined) {
      return selected
    }

    const providersConfig = get(configFields.providersConfig)
    const apiProvidersConfig = getAPIProvidersConfig(providersConfig)
    const firstProviderId = apiProvidersConfig.length > 0
      ? apiProvidersConfig[0].id
      : undefined
    return firstProviderId
  },
  (_get, set, newValue: string | undefined) => {
    set(internalSelectedProviderIdAtom, newValue)
  },
)
