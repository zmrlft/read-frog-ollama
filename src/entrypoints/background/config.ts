import type { Config } from '@/types/config/config'
import { storage } from '#imports'
import { initializeConfig } from '@/utils/config/init'
import { CONFIG_STORAGE_KEY } from '@/utils/constants/config'
import { onMessage } from '@/utils/message'

let configPromise: Promise<void> | null = null

export async function ensureConfig() {
  if (!configPromise) {
    configPromise = initializeConfig()
  }
  return storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
}

export function getConfigFromBackground() {
  onMessage('getInitialConfig', async () => {
    return await ensureConfig()
  })
}
