import { langCodeISO6393Schema } from '@repo/definitions'
import { z } from 'zod'
import { HOTKEYS } from '@/utils/constants/hotkeys'
import { MIN_TRANSLATE_CAPACITY, MIN_TRANSLATE_RATE } from '@/utils/constants/translate'
import { pageTranslateRangeSchema, promptsConfigSchema, TRANSLATE_PROVIDER_NAMES, translateModelsSchema, translationNodeStyleSchema } from './provider'

export const requestQueueConfigSchema = z.object({
  capacity: z.number().gte(MIN_TRANSLATE_CAPACITY),
  rate: z.number().gte(MIN_TRANSLATE_RATE),
})

export const TRANSLATION_MODES = ['bilingual', 'translationOnly'] as const
export const translationModeSchema = z.enum(TRANSLATION_MODES)

export const translateConfigSchema = z.object({
  provider: z.enum(TRANSLATE_PROVIDER_NAMES),
  models: translateModelsSchema,
  mode: translationModeSchema,
  node: z.object({
    enabled: z.boolean(),
    hotkey: z.enum(HOTKEYS),
  }),
  page: z.object({
    range: pageTranslateRangeSchema,
    autoTranslatePatterns: z.array(z.string()),
    autoTranslateLanguages: z.array(langCodeISO6393Schema),
  }),
  promptsConfig: promptsConfigSchema,
  requestQueueConfig: requestQueueConfigSchema,
  translationNodeStyle: translationNodeStyleSchema,
  customAutoTranslateShortcutKey: z.array(z.string()),
})

export type RequestQueueConfig = z.infer<typeof requestQueueConfigSchema>
export type TranslateConfig = z.infer<typeof translateConfigSchema>
export type TranslationMode = z.infer<typeof translationModeSchema>
