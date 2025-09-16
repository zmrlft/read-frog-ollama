import antfu from '@antfu/eslint-config'
import turboPlugin from 'eslint-plugin-turbo'

const antfuConfig = {
  formatters: {
    /**
     * Format CSS, LESS, SCSS files, also the `<style>` blocks
     * By default uses Prettier
     */
    css: true,
    /**
     * Format HTML files
     * By default uses Prettier
     */
    html: true,
    /**
     * Format Markdown files
     * Supports Prettier and dprint
     * By default uses Prettier
     */
    markdown: 'prettier',
  },
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'no-inner-declarations': 'error',
  },
}

const userConfigs = [{
  plugins: {
    turbo: turboPlugin,
  },
  rules: {
    'turbo/no-undeclared-env-vars': 'warn',
  },
}]

const typedUserConfigs = [
  ...userConfigs,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.md/**'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
]

// Default config without additional options
export const config = antfu(antfuConfig, userConfigs)
export const typedConfig = antfu(antfuConfig, typedUserConfigs)

// Function to create config with additional antfu options
export function createConfig(additionalOptions = {}) {
  return antfu({
    ...antfuConfig,
    ...additionalOptions,
  }, userConfigs)
}

// Function to create config with TypeScript type checking rules
export function createTypedConfig(additionalOptions = {}) {
  return antfu({
    ...antfuConfig,
    ...additionalOptions,
  }, typedUserConfigs)
}
