import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  imports: false,
  modules: ['@wxt-dev/module-react', '@wxt-dev/i18n/module'],
  manifestVersion: 3,

  // WXT 顶级 alias - 会自动同步到 tsconfig.json 的 paths 和 Vite 的 alias
  alias: process.env.USE_LOCAL_PACKAGES === 'true'
    ? {
        '@read-frog/definitions': path.resolve(__dirname, '../read-frog-monorepo/packages/definitions/src'),
        '@read-frog/ui': path.resolve(__dirname, '../read-frog-monorepo/packages/ui/src'),
        '@read-frog/orpc': path.resolve(__dirname, '../read-frog-monorepo/packages/orpc/src'),
      }
    : {},

  vite: () => {
    return {
      plugins: [],
      resolve: {
        alias: {
          // 保留 React 单例（Vite 专用配置，不影响 tsconfig.json 的 paths）
          'react': path.resolve(__dirname, './node_modules/react'),
          'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        },
      },
    }
  },
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
