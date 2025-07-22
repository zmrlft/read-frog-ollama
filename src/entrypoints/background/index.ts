import { browser, defineBackground } from '#imports'
import { WEBSITE_URL } from '@/utils/constants/url'
import { logger } from '@/utils/logger'
import { onMessage, sendMessage } from '@/utils/message'
import { setupCacheCleanup } from './cache-cleanup'
import { ensureConfig } from './config'
import { newUserGuide } from './new-user-guide'
import { setUpRequestQueue } from './request-queue'
import { translationMessage } from './translation'

export default defineBackground(() => {
  logger.info('Hello background!', { id: browser.runtime.id })

  browser.runtime.onInstalled.addListener(async (details) => {
    await ensureConfig()
    // Open tutorial page when extension is installed
    if (details.reason === 'install') {
      await browser.tabs.create({
        url: `${WEBSITE_URL}/guide/step-1`,
      })
    }
  })

  onMessage('getInitialConfig', async () => {
    return await ensureConfig()
  })

  onMessage('openOptionsPage', () => {
    logger.info('openOptionsPage')
    browser.runtime.openOptionsPage()
  })

  onMessage('popupRequestReadArticle', async (message) => {
    sendMessage('readArticle', undefined, message.data.tabId)
  })

  newUserGuide()
  translationMessage()

  setUpRequestQueue()
  setupCacheCleanup()
})
