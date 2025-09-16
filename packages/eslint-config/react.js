import { createTypedConfig } from './base.js'

export const config = createTypedConfig({
  react: true,
}).append({
  rules: {
    'react-refresh/only-export-components': 'off',
  },
})
