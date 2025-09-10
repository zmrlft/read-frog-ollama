import type { Config } from '@/types/config/config'

import type { ProvidersConfig } from '@/types/config/provider'

import { storage } from '#imports'
import { configSchema } from '@/types/config/config'
import { isReadProviderConfig } from '@/types/config/provider'
import {
  CONFIG_STORAGE_KEY,
} from '../constants/config'
import { sendMessage } from '../message'

// eslint-disable-next-line import/no-mutable-exports
export let globalConfig: Config | null = null

export function shouldDisableFloatingButton(url: string, config: Config): boolean {
  const disabledFloatingButtonPatterns = config?.floatingButton.disabledFloatingButtonPatterns
  if (!disabledFloatingButtonPatterns)
    return false

  return disabledFloatingButtonPatterns.some(pattern => url.toLowerCase().includes(pattern.toLowerCase()))
}

export async function loadGlobalConfig() {
  const config = await sendMessage('getInitialConfig', undefined)
  globalConfig = configSchema.parse(config)
}

storage.watch<Config>(`local:${CONFIG_STORAGE_KEY}`, (newConfig) => {
  globalConfig = configSchema.parse(newConfig)
})

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
