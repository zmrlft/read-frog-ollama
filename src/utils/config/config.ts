import type { Config } from '@/types/config/config'

import type { APIProviderNames, ProvidersConfig } from '@/types/config/provider'

import { storage } from '#imports'
import { configSchema } from '@/types/config/config'
import {
  CONFIG_STORAGE_KEY,
} from '../constants/config'
import { logger } from '../logger'
import { sendMessage } from '../message'

// eslint-disable-next-line import/no-mutable-exports
export let globalConfig: Config | null = null

export async function loadGlobalConfig() {
  const config = await sendMessage('getInitialConfig', undefined)
  if (configSchema.safeParse(config).success) {
    logger.info('Loaded global config', config)
    globalConfig = config
  }
}

storage.watch<Config>(`local:${CONFIG_STORAGE_KEY}`, (newConfig) => {
  if (configSchema.safeParse(newConfig).success) {
    globalConfig = newConfig
  }
})

export function isAnyAPIKey(providersConfig: ProvidersConfig) {
  return Object.values(providersConfig).some((providerConfig) => {
    return providerConfig.apiKey
  })
}

export function hasSetAPIKey(provider: APIProviderNames, providersConfig: ProvidersConfig) {
  return providersConfig[provider]?.apiKey !== undefined
}

// Dynamically adapt to all API key situations, theoretically should not fail
export function getConfigWithoutAPIKeys<T extends Record<string, any>>(config: T): T {
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
    return deepClean(config)
  }
  catch {
    return config
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
