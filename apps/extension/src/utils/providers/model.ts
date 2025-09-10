import type { Config } from '@/types/config/config'
import { storage } from '#imports'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { getLLMTranslateProvidersConfig, getProviderConfigByName } from '../config/helpers'
import { CONFIG_STORAGE_KEY } from '../constants/config'

interface ProviderFactoryMap {
  openai: typeof createOpenAI
  deepseek: typeof createDeepSeek
  gemini: typeof createGoogleGenerativeAI
}

const CREATE_AI_MAPPER: ProviderFactoryMap = {
  openai: createOpenAI,
  deepseek: createDeepSeek,
  gemini: createGoogleGenerativeAI,
}

async function getLanguageModel(providerName: string, modelType: 'read' | 'translate') {
  const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
  if (!config) {
    throw new Error('Config not found')
  }

  const LLMProvidersConfig = getLLMTranslateProvidersConfig(config.providersConfig)
  const providerConfig = getProviderConfigByName(LLMProvidersConfig, providerName)
  if (!providerConfig) {
    throw new Error(`Provider ${providerName} not found`)
  }

  const provider = CREATE_AI_MAPPER[providerConfig.provider]({
    baseURL: providerConfig.baseURL,
    apiKey: providerConfig.apiKey,
  })

  const modelConfig = providerConfig.models[modelType]
  const modelId = modelConfig.isCustomModel
    ? modelConfig.customModel
    : modelConfig.model

  if (!modelId) {
    throw new Error(`Model is undefined for ${modelType}`)
  }

  return provider.languageModel(modelId)
}

export async function getTranslateModel(providerName: string) {
  return getLanguageModel(providerName, 'translate')
}

export async function getReadModel(providerName: string) {
  return getLanguageModel(providerName, 'read')
}
