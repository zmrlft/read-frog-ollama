import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'zh'] as const
export type Locale = (typeof locales)[number]

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',
})

// TypeScript module augmentation for next-intl
// This ensures that useLocale() and other hooks return strictly typed locale values, e.g. ('en' | 'zh')
// instead of generic string type, providing better type safety and IDE autocomplete
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
  }
}
