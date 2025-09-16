import { createTypedConfig } from './base.js'

export const config = createTypedConfig({
  react: true,
  nextjs: true,
}).append({
  rules: {
    'react-refresh/only-export-components': 'off',
  },
})
