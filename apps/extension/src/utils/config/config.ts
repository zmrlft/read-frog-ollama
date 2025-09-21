import type { Config } from '@/types/config/config'
import type { ProvidersConfig } from '@/types/config/provider'
import { storage } from '#imports'
import { configSchema } from '@/types/config/config'
import { isReadProviderConfig } from '@/types/config/provider'
import {
  CONFIG_STORAGE_KEY,
} from '../constants/config'
import { logger } from '../logger'

export async function getConfigFromStorage() {
  const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
  if (!config) {
    logger.warn('No config found in storage, using default config')
    return null
  }
  return configSchema.parse(config)
}

export function isAnyAPIKeyForReadProviders(providersConfig: ProvidersConfig) {
  const readProvidersConfig = providersConfig.filter(isReadProviderConfig)
  return readProvidersConfig.some((providerConfig) => {
    return providerConfig.apiKey
  })
}

// Dynamically adapt to all API key situations, theoretically should not fail
export function getObjectWithoutAPIKeys<T extends Record<string, any>>(originalObject: T): T {
  function deepClean(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(deepClean)
    }
    if (obj && typeof obj === 'object') {
      const newObj: Record<string, any> = {}
      for (const key in obj) {
        if (key === 'apiKey') {
          continue
        }
        newObj[key] = deepClean(obj[key])
      }
      return newObj
    }
    return obj
  }

  try {
    return deepClean(originalObject)
  }
  catch {
    return originalObject
  }
}

export function hasAPIKey(obj: any): boolean {
  function deepCheck(obj: any): boolean {
    if (Array.isArray(obj)) {
      return obj.some(deepCheck)
    }
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key === 'apiKey' && obj[key]) {
          return true
        }
        if (deepCheck(obj[key])) {
          return true
        }
      }
    }
    return false
  }

  try {
    return deepCheck(obj)
  }
  catch {
    return false
  }
}
