import type { Config } from '@/types/config/config'
import { kebabCase } from 'case-anything'
import { globalConfig, loadGlobalConfig } from '@/utils/config/config'
import { APP_NAME } from '@/utils/constants/app'
import { CONFIG_STORAGE_KEY } from '@/utils/constants/config'
import { OFFICIAL_SITE_URL_PATTERNS } from '@/utils/constants/site'

export default defineContentScript({
  matches: OFFICIAL_SITE_URL_PATTERNS,
  async main() {
    onMessage('pinStateChanged', (msg) => {
      window.postMessage({ source: `${kebabCase(APP_NAME)}-ext`, ...msg }, '*')
    })

    window.addEventListener('message', async (e) => {
      await loadGlobalConfig()
      if (!globalConfig)
        return
      if (e.source !== window)
        return
      const { source, type } = e.data || {}
      if (source === 'read-frog-page' && type === 'getPinState') {
        const isPinned = await sendMessage('getPinState', undefined)
        window.postMessage({ source: `${kebabCase(APP_NAME)}-ext`, type: 'getPinState', data: { isPinned } }, '*')
      }
      else if (source === 'read-frog-page' && type === 'setTargetLanguage') {
        const langCodeISO6393 = e.data.langCodeISO6393 ?? 'eng'
        // TODO: solve this race condition by distribution system knowledge
        // wait for 500ms for race condition
        // otherwise, if we enter guide page step 1, it trigger setTargetLanguage immediately
        // then other place get the initial config and set that back by watch, it will be overwritten back to initial config
        // then we lose the target language
        await new Promise(resolve => setTimeout(resolve, 500))
        await storage.setItem<Config>(`local:${CONFIG_STORAGE_KEY}`, {
          ...globalConfig,
          language: { ...globalConfig.language, targetCode: langCodeISO6393 },
        })
      }
      else if (source === 'read-frog-page' && type === 'getTargetLanguage') {
        const targetLanguage = globalConfig.language.targetCode
        window.postMessage({ source: `${kebabCase(APP_NAME)}-ext`, type: 'getTargetLanguage', data: { targetLanguage } }, '*')
      }
    })
  },
})
