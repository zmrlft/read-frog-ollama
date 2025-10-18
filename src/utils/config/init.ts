import type { Config } from '@/types/config/config'
import type { ProvidersConfig } from '@/types/config/provider'
import { storage } from '#imports'
import { configSchema } from '@/types/config/config'
import { isAPIProviderConfig } from '@/types/config/provider'
import { CONFIG_SCHEMA_VERSION, CONFIG_SCHEMA_VERSION_STORAGE_KEY, CONFIG_STORAGE_KEY, DEFAULT_CONFIG } from '../constants/config'
import { logger } from '../logger'
import { runMigration } from './migration'

/**
 * Initialize the config, this function should only be called once in the background script
 * @returns The extension config
 */
export async function initializeConfig() {
  const [storedConfig, storedConfigSchemaVersion] = await Promise.all([
    storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`),
    storage.getItem<number>(`local:${CONFIG_SCHEMA_VERSION_STORAGE_KEY}`),
  ])

  let config: Config | null = storedConfig
  let currentVersion = storedConfigSchemaVersion ?? 1

  if (!config) {
    config = DEFAULT_CONFIG
    currentVersion = CONFIG_SCHEMA_VERSION
  }

  while (currentVersion < CONFIG_SCHEMA_VERSION) {
    const nextVersion = currentVersion + 1
    try {
      config = await runMigration(nextVersion, config)
      currentVersion = nextVersion
    }
    catch (error) {
      console.error(`Migration to version ${nextVersion} failed:`, error)
      currentVersion = nextVersion
    }
  }

  if (!configSchema.safeParse(config).success) {
    logger.warn('Config is invalid, using default config')
    config = DEFAULT_CONFIG
    currentVersion = CONFIG_SCHEMA_VERSION
  }

  await Promise.all([
    storage.setItem<Config>(`local:${CONFIG_STORAGE_KEY}`, config),
    storage.setItem<number>(`local:${CONFIG_SCHEMA_VERSION_STORAGE_KEY}`, currentVersion),
  ])

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (import.meta.env.DEV) {
    await loadAPIKeyFromEnv()
    await enableBetaExperience()
  }
}

async function loadAPIKeyFromEnv() {
  const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
  if (!config) {
    return
  }

  // Use reduce to maintain type safety with the new array-based providersConfig
  const updatedProvidersConfig: ProvidersConfig = config.providersConfig.reduce<ProvidersConfig>(
    (acc, providerConfig) => {
      // Only add API key for providers that support it
      if (isAPIProviderConfig(providerConfig)) {
        const apiKeyEnvName = `WXT_${providerConfig.provider.toUpperCase()}_API_KEY`
        const envApiKey = import.meta.env[apiKeyEnvName] as string | undefined

        // If env variable exists, update the config with the API key
        if (envApiKey) {
          return [...acc, {
            ...providerConfig,
            apiKey: envApiKey,
          }]
        }
      }

      // Keep the original config if no API key needed or not found
      return [...acc, providerConfig]
    },
    [],
  )

  await storage.setItem(`local:${CONFIG_STORAGE_KEY}`, {
    ...config,
    providersConfig: updatedProvidersConfig,
  })
}

async function enableBetaExperience() {
  const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
  if (!config) {
    return
  }
  config.betaExperience.enabled = true
  await storage.setItem(`local:${CONFIG_STORAGE_KEY}`, config)
}
