import { config } from '@repo/eslint-config/base'

export default config.append(
  {
    ignores: ['apps/**/*', 'packages/**/*', 'node_modules/**/*', 'dist/**/*', '.turbo/**/*'],
  },
)
