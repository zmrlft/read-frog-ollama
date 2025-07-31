import { antfuConfig as baseAntfuConfig } from './base.js'
import antfu from '@antfu/eslint-config'

export const config = antfu(
  {
    ...baseAntfuConfig,
  },
  {
    ignores: ['migrations/**/*'],
  },
)