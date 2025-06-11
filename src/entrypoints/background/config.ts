import type { Config } from '@/types/config/config'
import { initializeConfig } from '@/utils/config/init'

let configPromise: Promise<Config | null> | null = null

export async function ensureConfig() {
  if (!configPromise) {
    configPromise = initializeConfig()
  }
  return configPromise
}

export function getConfigFromBackground() {
  onMessage('getInitialConfig', async () => {
    return await ensureConfig()
  })
}
