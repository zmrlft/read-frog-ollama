import type { PartialDeep } from 'type-fest'
import type { LLMTranslateProviderConfig, ProviderConfig } from '@/types/config/provider'
import { deepmerge } from 'deepmerge-ts'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { llmProviderConfigItemSchema, providerConfigItemSchema } from '@/types/config/provider'
import { getLLMTranslateProvidersConfig, getProviderConfigById } from '../config/helpers'
import { configFields } from './config'

// Derived atom for read provider config
export const readProviderConfigAtom = atom(
  (get) => {
    const readConfig = get(configFields.read)
    const providersConfig = get(configFields.providersConfig)
    const LLMProvidersConfig = getLLMTranslateProvidersConfig(providersConfig)
    const providerConfig = getProviderConfigById(LLMProvidersConfig, readConfig.providerId)
    if (!providerConfig) {
      throw new Error(`Provider ${readConfig.providerId} not found`)
    }
    return providerConfig
  },
  async (get, set, newProviderConfig: LLMTranslateProviderConfig) => {
    const readConfig = get(configFields.read)
    const providersConfig = get(configFields.providersConfig)

    const updatedProviders = providersConfig.map(provider =>
      provider.id === readConfig.providerId ? newProviderConfig : provider,
    )

    await set(configFields.providersConfig, updatedProviders)
  },
)

// Derived atom for translate provider config
export const translateProviderConfigAtom = atom(
  (get) => {
    const translateConfig = get(configFields.translate)
    const providersConfig = get(configFields.providersConfig)

    const providerConfig = getProviderConfigById(providersConfig, translateConfig.providerId)
    if (providerConfig)
      return providerConfig

    // Non API translate providers (google, microsoft) don't have config
    return undefined
  },
  async (get, set, newProviderConfig: ProviderConfig) => {
    const translateConfig = get(configFields.translate)
    const providersConfig = get(configFields.providersConfig)

    const updatedProviders = providersConfig.map(provider =>
      provider.id === translateConfig.providerId ? newProviderConfig : provider,
    )

    await set(configFields.providersConfig, updatedProviders)
  },
)

// Generic provider config atom family that accepts a name parameter
export const providerConfigAtom = atomFamily((id: string) =>
  atom(
    (get) => {
      const providersConfig = get(configFields.providersConfig)
      return getProviderConfigById(providersConfig, id)
    },
    async (get, set, newProviderConfig: ProviderConfig) => {
      const providersConfig = get(configFields.providersConfig)

      const updatedProviders = providersConfig.map(provider =>
        provider.id === id ? newProviderConfig : provider,
      )

      await set(configFields.providersConfig, updatedProviders)
    },
  ),
)

export function updateLLMProviderConfig(
  config: LLMTranslateProviderConfig,
  updates: PartialDeep<LLMTranslateProviderConfig>,
): LLMTranslateProviderConfig {
  const result = deepmerge(config, updates)
  return llmProviderConfigItemSchema.parse(result)
}

export function updateProviderConfig(
  config: ProviderConfig,
  updates: PartialDeep<ProviderConfig>,
): ProviderConfig {
  const result = deepmerge(config, updates)
  return providerConfigItemSchema.parse(result)
}
