import pluginQuery from '@tanstack/eslint-plugin-query'
import { createConfig } from './base.js'

export const config = createConfig({
  react: true,
}).append({
  plugins: {
    '@tanstack/query': pluginQuery,
  },
  rules: {
    'react-refresh/only-export-components': 'off',
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/no-rest-destructuring': 'warn',
    '@tanstack/query/stable-query-client': 'error',
    // vitest rule - use antfu built-in test/* prefix
    'test/consistent-test-it': 'error',
    'test/no-identical-title': 'error',
    'test/prefer-hooks-on-top': 'error',
  },
})
