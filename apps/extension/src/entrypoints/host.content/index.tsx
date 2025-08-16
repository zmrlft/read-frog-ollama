import { browser, createShadowRootUi, defineContentScript } from '#imports'
import { kebabCase } from 'case-anything'
import ReactDOM from 'react-dom/client'
// import eruda from 'eruda'
import { globalConfig, loadGlobalConfig } from '@/utils/config/config'
import { APP_NAME } from '@/utils/constants/app'
import { shouldEnableAutoTranslation } from '@/utils/host/translate/auto-translation'
import { validateTranslationConfig } from '@/utils/host/translate/translate-text'
import { logger } from '@/utils/logger'
import { sendMessage } from '@/utils/message'
import { protectSelectAllShadowRoot } from '@/utils/select-all'
import { insertShadowRootUIWrapperInto } from '@/utils/shadow-root'
import { addStyleToShadow } from '@/utils/styles'
import App from './app'
import { registerNodeTranslationTriggers } from './translation-control/node-translation'

import { PageTranslationManager } from './translation-control/page-translation'
import './listen'
import './style.css'

export default defineContentScript({
  matches: ['*://*/*'],
  cssInjectionMode: 'manifest',
  async main(ctx) {
    await loadGlobalConfig()
    // eruda.init()

    const ui = await createShadowRootUi(ctx, {
      name: `${kebabCase(APP_NAME)}-selection`,
      position: 'overlay',
      anchor: 'body',
      onMount: (container, shadow, shadowHost) => {
        // Container is a body, and React warns when creating a root on the body, so create a wrapper div
        const wrapper = insertShadowRootUIWrapperInto(container)
        addStyleToShadow(shadow)
        protectSelectAllShadowRoot(shadowHost, wrapper)

        // Create a root on the UI container and render a component
        const root = ReactDOM.createRoot(wrapper)
        root.render(
          <App />,
        )
        return root
      },
      onRemove: (root) => {
        // Unmount the root when the UI is removed
        root?.unmount()
      },
    })

    // 4. Mount the UI
    ui.mount()

    registerNodeTranslationTriggers()

    const port = browser.runtime.connect({ name: 'translation-host.content' })
    const manager = new PageTranslationManager({
      root: null,
      rootMargin: '1000px',
      threshold: 0,
    })

    manager.registerPageTranslationTriggers()

    const handleUrlChange = (from: string, to: string) => {
      if (from !== to) {
        logger.info('URL changed from', from, 'to', to)
        if (manager.isActive) {
          manager.stop()
        }
        // Notify background script that URL has changed, let it decide whether to automatically enable translation
        sendMessage('resetPageTranslationOnNavigation', { url: to })
      }
    }

    window.addEventListener('extension:URLChange', (e: any) => {
      const { from, to } = e.detail
      handleUrlChange(from, to)
    })

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Listen for Alt + Q for translation toggle (Windows: Alt + Q, Mac: Option + Q)
      if (
        e.altKey
        && !e.ctrlKey
        && !e.shiftKey
        && !e.metaKey
        && (e.code === 'KeyQ' || (typeof e.key === 'string' && e.key.toLowerCase() === 'q'))
      ) {
        e.preventDefault() // Prevent any default browser behavior
        if (manager.isActive) {
          manager.stop()
        }
        else {
          if (!validateTranslationConfig({
            providersConfig: globalConfig!.providersConfig,
            translate: globalConfig!.translate,
            language: globalConfig!.language,
          })) {
            return
          }
          manager.start()
        }
      }
    }, { capture: true })

    port.onMessage.addListener((msg) => {
      logger.info('onMessage', msg)
      if (msg.type !== 'STATUS_PUSH' || msg.enabled === manager.isActive)
        return
      msg.enabled ? manager.start() : manager.stop()
    })

    // ! Temporary code for browser has no port.onMessage.addListener api like Orion
    const autoEnable = globalConfig && await shouldEnableAutoTranslation(window.location.href, globalConfig)
    if (autoEnable && !manager.isActive)
      manager.start()
  },
})
