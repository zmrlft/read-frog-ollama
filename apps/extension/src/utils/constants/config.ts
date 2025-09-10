import type { Config } from '@/types/config/config'
import type { AllProviderNames, ProvidersConfig, PureAPIProviderConfig, ReadModels, TranslateLLMModels } from '@/types/config/provider'
import type { PageTranslateRange } from '@/types/config/translate'
import deeplxLogo from '@/assets/providers/deeplx.png'
import deepseekLogo from '@/assets/providers/deepseek.png'
import geminiLogo from '@/assets/providers/gemini.png'
import googleLogo from '@/assets/providers/google.png'
import microsoftLogo from '@/assets/providers/microsoft.png'
import openaiLogo from '@/assets/providers/openai.jpg'
import { API_PROVIDER_NAMES, NON_API_TRANSLATE_PROVIDERS, NON_API_TRANSLATE_PROVIDERS_MAP, PURE_TRANSLATE_PROVIDERS, READ_PROVIDER_NAMES, TRANSLATE_PROVIDER_NAMES } from '@/types/config/provider'
import { omit, pick } from '@/types/utils'
import { DEFAULT_TRANSLATE_PROMPTS_CONFIG } from './prompt'
import { DEFAULT_SIDE_CONTENT_WIDTH } from './side'
import { DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY, DEFAULT_REQUEST_CAPACITY, DEFAULT_REQUEST_RATE } from './translate'
import { DEFAULT_TRANSLATION_NODE_STYLE } from './translation-node-style'

export const CONFIG_STORAGE_KEY = 'config'
export const CONFIG_SCHEMA_VERSION = 22

export const DEFAULT_FLOATING_BUTTON_POSITION = 0.66

export const DEFAULT_READ_MODELS: ReadModels = {
  openai: {
    model: 'gpt-4.1-mini',
    isCustomModel: false,
    customModel: null,
  },
  deepseek: {
    model: 'deepseek-chat',
    isCustomModel: false,
    customModel: null,
  },
  gemini: {
    model: 'gemini-2.5-pro',
    isCustomModel: false,
    customModel: null,
  },
}

export const DEFAULT_TRANSLATE_MODELS: TranslateLLMModels = {
  openai: {
    model: 'gpt-4.1-mini',
    isCustomModel: false,
    customModel: null,
  },
  deepseek: {
    model: 'deepseek-chat',
    isCustomModel: false,
    customModel: null,
  },
  gemini: {
    model: 'gemini-1.5-flash',
    isCustomModel: false,
    customModel: null,
  },
}

export const DEFAULT_DEEPLX_BASE_URL = 'https://deeplx.vercel.app'
export const DEFAULT_DEEPLX_CONFIG: PureAPIProviderConfig = {
  name: 'DeepLX',
  provider: 'deeplx',
  baseURL: DEFAULT_DEEPLX_BASE_URL,
}

export const DEFAULT_PROVIDER_CONFIG: ProvidersConfig = [
  {
    name: 'Google Translate',
    provider: 'google',
  },
  {
    name: 'Microsoft Translator',
    provider: 'microsoft',
  },
  {
    name: 'OpenAI',
    provider: 'openai',
    models: {
      read: DEFAULT_READ_MODELS.openai,
      translate: DEFAULT_TRANSLATE_MODELS.openai,
    },
  },
  {
    name: 'DeepSeek',
    provider: 'deepseek',
    models: {
      read: DEFAULT_READ_MODELS.deepseek,
      translate: DEFAULT_TRANSLATE_MODELS.deepseek,
    },
  },
  {
    name: 'Gemini',
    provider: 'gemini',
    models: {
      read: DEFAULT_READ_MODELS.gemini,
      translate: DEFAULT_TRANSLATE_MODELS.gemini,
    },
  },
  DEFAULT_DEEPLX_CONFIG,
]

export const DEFAULT_CONFIG: Config = {
  language: {
    detectedCode: 'eng',
    sourceCode: 'auto',
    targetCode: 'cmn',
    level: 'intermediate',
  },
  providersConfig: DEFAULT_PROVIDER_CONFIG,
  read: {
    providerName: 'OpenAI',
  },
  translate: {
    providerName: 'Microsoft Translator',
    mode: 'bilingual',
    node: {
      enabled: true,
      hotkey: 'Control',
    },
    page: {
      range: 'main',
      autoTranslatePatterns: ['news.ycombinator.com'],
      autoTranslateLanguages: [],
    },
    promptsConfig: DEFAULT_TRANSLATE_PROMPTS_CONFIG,
    requestQueueConfig: {
      capacity: DEFAULT_REQUEST_CAPACITY,
      rate: DEFAULT_REQUEST_RATE,
    },
    translationNodeStyle: DEFAULT_TRANSLATION_NODE_STYLE,
    customAutoTranslateShortcutKey: DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY,
  },
  floatingButton: {
    enabled: true,
    position: DEFAULT_FLOATING_BUTTON_POSITION,
    disabledFloatingButtonPatterns: [],
  },
  selectionToolbar: {
    enabled: true,
  },
  sideContent: {
    width: DEFAULT_SIDE_CONTENT_WIDTH,
  },
}

export const PROVIDER_ITEMS: Record<AllProviderNames, { logo: string, name: string }>
  = {
    microsoft: {
      logo: microsoftLogo,
      name: NON_API_TRANSLATE_PROVIDERS_MAP.microsoft,
    },
    google: {
      logo: googleLogo,
      name: NON_API_TRANSLATE_PROVIDERS_MAP.google,
    },
    deeplx: {
      logo: deeplxLogo,
      name: 'DeepLX',
    },
    openai: {
      logo: openaiLogo,
      name: 'OpenAI',
    },
    deepseek: {
      logo: deepseekLogo,
      name: 'DeepSeek',
    },
    gemini: {
      logo: geminiLogo,
      name: 'Gemini',
    },
  }

export const NON_API_TRANSLATE_PROVIDER_ITEMS = pick(
  PROVIDER_ITEMS,
  NON_API_TRANSLATE_PROVIDERS,
)

export const TRANSLATE_PROVIDER_ITEMS = pick(
  PROVIDER_ITEMS,
  TRANSLATE_PROVIDER_NAMES,
)

export const PURE_TRANSLATE_PROVIDER_ITEMS = pick(
  TRANSLATE_PROVIDER_ITEMS,
  PURE_TRANSLATE_PROVIDERS,
)

export const LLM_TRANSLATE_PROVIDER_ITEMS = omit(
  TRANSLATE_PROVIDER_ITEMS,
  PURE_TRANSLATE_PROVIDERS,
)

export const READ_PROVIDER_ITEMS = pick(
  PROVIDER_ITEMS,
  READ_PROVIDER_NAMES,
)

export const API_PROVIDER_ITEMS = pick(
  PROVIDER_ITEMS,
  API_PROVIDER_NAMES,
)

export const PAGE_TRANSLATE_RANGE_ITEMS: Record<
  PageTranslateRange,
  { label: string }
> = {
  main: { label: 'Main' },
  all: { label: 'All' },
}
