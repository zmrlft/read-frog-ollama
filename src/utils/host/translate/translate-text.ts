import type { Config } from '@/types/config/config'
import type { TRANSLATE_PROVIDER_MODELS } from '@/types/config/provider'
import { i18n } from '#imports'
import { toast } from 'sonner'
import { ISO6393_TO_6391, LANG_CODE_TO_EN_NAME, LANG_CODE_TO_LOCALE_NAME } from '@/types/config/languages'
import { isPureTranslateProvider, PURE_TRANSLATE_PROVIDERS } from '@/types/config/provider'
import { logger } from '@/utils/logger'
import { globalConfig, hasSetAPIKey } from '../../config/config'
import { Sha256Hex } from '../../hash'
import { sendMessage } from '../../message'
import { getTranslatePrompt } from '../../prompts/translate'

export async function translateText(sourceText: string) {
  if (!globalConfig) {
    throw new Error('No global config when translate text')
  }
  const provider = globalConfig.translate.provider
  const modelConfig = globalConfig.translate.models[provider]
  if (!modelConfig && !isPureTranslateProvider(provider)) {
    throw new Error(`No configuration found for provider: ${provider}`)
  }
  const modelString = modelConfig?.isCustomModel ? modelConfig.customModel : modelConfig?.model

  // replace /\u200B/g is for Feishu, it's a zero-width space
  const cleanSourceText = sourceText.replace(/\u200B/g, '').trim()

  let translatedText = ''

  if (isPureTranslateProvider(provider)) {
    const sourceLang = globalConfig.language.sourceCode === 'auto' ? 'auto' : (ISO6393_TO_6391[globalConfig.language.sourceCode] ?? 'auto')
    const targetLang = ISO6393_TO_6391[globalConfig.language.targetCode]
    if (!targetLang) {
      throw new Error('Invalid target language code')
    }
    translatedText = await sendMessage('enqueueRequest', {
      type: `${provider}Translate`,
      params: { text: cleanSourceText, fromLang: sourceLang, toLang: targetLang },
      scheduleAt: Date.now(),
      hash: Sha256Hex(cleanSourceText, provider, sourceLang, targetLang),
    })
  }
  else if (modelString) {
    const targetLang = LANG_CODE_TO_EN_NAME[globalConfig.language.targetCode]
    if (!targetLang) {
      throw new Error('Invalid target language code')
    }
    const prompt = getTranslatePrompt(targetLang, cleanSourceText)
    const text = await sendMessage('enqueueRequest', {
      type: 'aiTranslate',
      params: {
        provider,
        modelString,
        prompt,
      },
      scheduleAt: Date.now(),
      hash: Sha256Hex(cleanSourceText, provider, modelString, targetLang, prompt),
    })
    // Some deep thinking models, such as deepseek, return the thinking process. Therefore,
    // the thinking process in the <think></think> tag needs to be filtered out and only the result is returned
    const [, extracted = text] = text.match(/<\/think>([\s\S]*)/) || []
    translatedText = extracted
  }
  translatedText = translatedText.trim()

  return cleanSourceText === translatedText ? '' : translatedText
}

export function validateTranslationConfig(config: Pick<Config, 'providersConfig' | 'translate' | 'language'>): boolean {
  const { providersConfig, translate: translateConfig, language: languageConfig } = config
  const provider = translateConfig.provider

  const isPure = PURE_TRANSLATE_PROVIDERS.includes(
    provider as typeof PURE_TRANSLATE_PROVIDERS[number],
  )
  // 检查语言是否相同
  if (isPure) {
    if (languageConfig.sourceCode === languageConfig.targetCode) {
      toast.error(i18n.t('translation.sameLanguage'))
      logger.info('validateTranslationConfig: returning false (same language)')
      return false
    }
    else if (languageConfig.sourceCode === 'auto' && languageConfig.detectedCode === languageConfig.targetCode) {
      toast.warning(i18n.t('translation.autoModeSameLanguage', [
        LANG_CODE_TO_LOCALE_NAME[languageConfig.detectedCode] ?? languageConfig.detectedCode,
      ]))
    }
  }

  // 检查API密钥是否配置
  if (!isPure && !hasSetAPIKey(provider as keyof typeof TRANSLATE_PROVIDER_MODELS, providersConfig)) {
    toast.error(i18n.t('noAPIKeyConfig.warning'))
    logger.info('validateTranslationConfig: returning false (no API key)')
    return false
  }

  return true
}
