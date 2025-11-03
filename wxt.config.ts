import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  imports: false,
  modules: ['@wxt-dev/module-react', '@wxt-dev/i18n/module'],
  manifestVersion: 3,
  vite: () => ({
    plugins: [],
  }),
  manifest: ({ mode, browser }) => ({
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: ['storage', 'tabs', 'alarms', 'cookies'],
    host_permissions:
      mode === 'development'
        ? [
            'http://localhost:*/*',
          ]
        : [
            'https://*.readfrog.app/*',
            'https://readfrog.app/*', // Include both www and non-www versions
          ],
    // Firefox-specific settings for MV3
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'extension@readfrog.app',
          strict_min_version: '109.0',
        },
      },
    }),
  }),
  dev: {
    server: {
      port: 3333,
    },
  },
})
