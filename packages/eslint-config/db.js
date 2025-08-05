import { config as baseConfig } from './base.js'

export const config = baseConfig.append({
  ignores: ['migrations/**/*'],
})
