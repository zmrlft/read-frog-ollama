import type { Config } from '@/types/config/config'
import type { TranslationState } from '@/types/translation-state'
import { browser, storage } from '#imports'
import { CONFIG_STORAGE_KEY } from '@/utils/constants/config'
import { getTranslationStateKey } from '@/utils/constants/storage-keys'
import { shouldEnableAutoTranslation } from '@/utils/host/translate/auto-translation'
import { logger } from '@/utils/logger'
import { onMessage, sendMessage } from '@/utils/message'

export function translationMessage() {
  // === Message Handlers ===
  onMessage('getEnablePageTranslation', async (msg) => {
    const { tabId } = msg.data
    return await getTranslationState(tabId)
  })

  onMessage('getEnablePageTranslationFromContentScript', async (msg) => {
    const tabId = msg.sender?.tab?.id
    if (typeof tabId === 'number') {
      return await getTranslationState(tabId)
    }
    logger.error('Invalid tabId in getEnablePageTranslationFromContentScript', msg)
    return false
  })

  onMessage('setEnablePageTranslation', async (msg) => {
    const { tabId, enabled } = msg.data
    await setTranslationState(tabId, enabled)
  })

  onMessage('setEnablePageTranslationOnContentScript', async (msg) => {
    const tabId = msg.sender?.tab?.id
    const { enabled } = msg.data
    if (typeof tabId === 'number') {
      await setTranslationState(tabId, enabled)
    }
    else {
      logger.error('tabId is not a number', msg)
    }
  })

  onMessage('checkAndSetAutoTranslation', async (msg) => {
    const tabId = msg.sender?.tab?.id
    const { url } = msg.data
    if (typeof tabId === 'number') {
      const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
      if (!config)
        return
      const shouldEnable = await shouldEnableAutoTranslation(url, config)
      await setTranslationState(tabId, shouldEnable)
    }
  })

  // === Helper Functions ===
  async function getTranslationState(tabId: number): Promise<boolean> {
    const state = await storage.getItem<TranslationState>(
      getTranslationStateKey(tabId),
    )
    return state?.enabled ?? false
  }

  async function setTranslationState(tabId: number, enabled: boolean) {
    await storage.setItem<TranslationState>(
      getTranslationStateKey(tabId),
      { enabled },
    )
    // Notify content script in that specific tab
    void sendMessage('translationStateChanged', { enabled }, tabId)
  }

  // === Cleanup ===
  browser.tabs.onRemoved.addListener(async (tabId) => {
    await storage.removeItem(getTranslationStateKey(tabId))
  })
}
