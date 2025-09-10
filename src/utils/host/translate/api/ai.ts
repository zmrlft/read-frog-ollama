import type { JSONValue } from 'ai'
import type { LLMTranslateProviderConfig } from '@/types/config/provider'
import { generateText } from 'ai'
import { THINKING_MODELS } from '@/types/config/provider'
import { getTranslatePrompt } from '@/utils/prompts/translate'
import { getTranslateModel } from '@/utils/providers/model'

const DEFAULT_THINKING_BUDGET = 128

export async function aiTranslate(text: string, targetLangName: string, providerConfig: LLMTranslateProviderConfig) {
  const { name: providerName, models: { translate } } = providerConfig
  const translateModel = translate.isCustomModel ? translate.customModel : translate.model
  const model = await getTranslateModel(providerName)

  const providerOptions: Record<string, Record<string, JSONValue>> = {
    google: {
      thinkingConfig: {
        thinkingBudget: THINKING_MODELS.includes(translateModel as (typeof THINKING_MODELS)[number]) ? DEFAULT_THINKING_BUDGET : 0,
      },
    },
  }

  const prompt = getTranslatePrompt(targetLangName, text)

  const { text: translatedText } = await generateText({
    model,
    prompt,
    providerOptions,
  })

  const [, finalTranslation = translatedText] = translatedText.match(/<\/think>([\s\S]*)/) || []

  return finalTranslation
}
