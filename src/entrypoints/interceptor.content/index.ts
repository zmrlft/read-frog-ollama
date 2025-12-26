import { defineContentScript } from '#imports'
import { injectXhrInterceptor } from './inject-xhr-interceptor'

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  world: 'MAIN',
  runAt: 'document_start',
  main() {
    injectXhrInterceptor()
  },
})
