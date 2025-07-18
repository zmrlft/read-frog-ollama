import { kebabCase } from 'case-anything'
import { APP_NAME } from '@/utils/constants/app.ts'

export default defineContentScript({
  matches: ['*://*/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: `${kebabCase(APP_NAME)}-selection`,
      position: 'overlay',
      anchor: 'body',
      onMount: (container) => {
        // Container is a body, and React warns when creating a root on the body, so create a wrapper div
        const app = document.createElement('div')
        container.append(app)

        // Create a root on the UI container and render a component
        // const root = ReactDOM.createRoot(app)
        // root.render(<App />)
        // return root
      },
      // onRemove: (root) => {
      //   // Unmount the root when the UI is removed
      //   root?.unmount()
      // },
    })

    // 4. Mount the UI
    ui.mount()
  },
})
