import type { Config } from '@/types/config/config'
import type { LLMTranslateProviderConfig, NonAPIProviderConfig, ProviderConfig, ProvidersConfig, PureAPIProviderConfig, ReadProviderConfig } from '@/types/config/provider'
import { isAPIProviderConfig, isLLMTranslateProviderConfig, isNonAPIProviderConfig, isPureAPIProviderConfig, isReadProviderConfig } from '@/types/config/provider'

export function getProviderConfigByName<T extends ProviderConfig>(providersConfig: T[], providerName: string): T | undefined {
  return providersConfig.find(p => p.name === providerName)
}

export function getProviderConfigByKey<T extends ProviderConfig>(providersConfig: T[], providerKey: string): T | undefined {
  return providersConfig.find(p => p.provider === providerKey)
}

export function getLLMTranslateProvidersConfig(providersConfig: ProvidersConfig): LLMTranslateProviderConfig[] {
  return providersConfig.filter(isLLMTranslateProviderConfig)
}

export function getPureAPIProviderConfig(providersConfig: ProvidersConfig): PureAPIProviderConfig[] {
  return providersConfig.filter(isPureAPIProviderConfig)
}

export function getNonAPIProvidersConfig(providersConfig: ProvidersConfig): NonAPIProviderConfig[] {
  return providersConfig.filter(isNonAPIProviderConfig)
}

export function getReadProvidersConfig(providersConfig: ProvidersConfig): ReadProviderConfig[] {
  return providersConfig.filter(isReadProviderConfig)
}

export function getProviderKeyByName(providersConfig: ProvidersConfig, providerName: string): string | undefined {
  const provider = getProviderConfigByName(providersConfig, providerName)
  return provider?.provider
}

export function getReadModelConfig(config: Config, providerName: string) {
  const provider = getProviderConfigByName(config.providersConfig, providerName)
  if (provider && isReadProviderConfig(provider)) {
    return provider.models.read
  }
  return undefined
}

export function getTranslateModelConfig(config: Config, providerName: string) {
  const providerConfig = getProviderConfigByName(config.providersConfig, providerName)
  if (providerConfig && isLLMTranslateProviderConfig(providerConfig)) {
    return providerConfig.models.translate
  }
  return undefined
}

export function getProviderApiKey(providersConfig: ProvidersConfig, providerName: string): string | undefined {
  const providerConfig = getProviderConfigByName(providersConfig, providerName)
  if (providerConfig && isAPIProviderConfig(providerConfig)) {
    return providerConfig.apiKey
  }
  return undefined
}

export function getProviderBaseURL(providersConfig: ProvidersConfig, providerName: string): string | undefined {
  const providerConfig = getProviderConfigByName(providersConfig, providerName)
  if (providerConfig && isAPIProviderConfig(providerConfig)) {
    return providerConfig.baseURL
  }
  return undefined
}
