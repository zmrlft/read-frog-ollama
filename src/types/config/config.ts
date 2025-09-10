import { langCodeISO6393Schema, langLevel } from '@repo/definitions'

import { z } from 'zod'
import { MIN_SIDE_CONTENT_WIDTH } from '@/utils/constants/side'
import { NON_API_TRANSLATE_PROVIDERS_MAP, providersConfigSchema } from './provider'
import { readConfigSchema } from './read'
import { translateConfigSchema } from './translate'
// Language schema
const languageSchema = z.object({
  detectedCode: langCodeISO6393Schema,
  sourceCode: langCodeISO6393Schema.or(z.literal('auto')),
  targetCode: langCodeISO6393Schema,
  level: langLevel,
})

// Floating button schema
const floatingButtonSchema = z.object({
  enabled: z.boolean(),
  position: z.number().min(0).max(1),
  disabledFloatingButtonPatterns: z.array(z.string()),
})

// Text selection button schema
const selectionToolbarSchema = z.object({
  enabled: z.boolean(),
})

// side content schema
const sideContentSchema = z.object({
  width: z.number().min(MIN_SIDE_CONTENT_WIDTH),
})

// Complete config schema
export const configSchema = z.object({
  language: languageSchema,
  providersConfig: providersConfigSchema,
  read: readConfigSchema,
  translate: translateConfigSchema,
  floatingButton: floatingButtonSchema,
  selectionToolbar: selectionToolbarSchema,
  sideContent: sideContentSchema,
}).superRefine((data, ctx) => {
  const providerNamesSet = new Set(data.providersConfig.map(p => p.name))
  const providerNames = Array.from(providerNamesSet)

  if (!providerNamesSet.has(data.read.providerName)) {
    ctx.addIssue({
      code: 'invalid_value',
      values: providerNames,
      message: `Invalid provider name "${data.read.providerName}". Must be one of: ${providerNames.join(', ')}`,
      path: ['read', 'providerName'],
    })
  }

  const validTranslateProviders = [...providerNames, ...Object.values(NON_API_TRANSLATE_PROVIDERS_MAP)]
  const validTranslateProvidersSet = new Set(validTranslateProviders)

  if (!validTranslateProvidersSet.has(data.translate.providerName)) {
    ctx.addIssue({
      code: 'invalid_value',
      values: validTranslateProviders,
      message: `Invalid provider name "${data.translate.providerName}". Must be one of: ${validTranslateProviders.join(', ')}`,
      path: ['translate', 'providerName'],
    })
  }
})

export type Config = z.infer<typeof configSchema>
