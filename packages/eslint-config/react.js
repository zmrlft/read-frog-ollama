import { createConfig } from './base.js'

export const config = createConfig({
  react: true,
}).append({
  rules: {
    'react-refresh/only-export-components': 'off',
  },
})
