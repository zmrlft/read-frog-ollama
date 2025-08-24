import type { JSONValue } from 'ai'
import type { LLMTranslateProviderNames } from '@/types/config/provider'
import { generateText } from 'ai'
import { THINKING_MODELS } from '@/types/config/provider'
import { getTranslateModel } from '@/utils/provider'

const DEFAULT_THINKING_BUDGET = 128

export async function aiTranslate(provider: LLMTranslateProviderNames, modelString: string, prompt: string) {
  const model = await getTranslateModel(provider, modelString)

  const providerOptions: Record<string, Record<string, JSONValue>> = {
    google: {
      thinkingConfig: {
        thinkingBudget: THINKING_MODELS.includes(modelString as (typeof THINKING_MODELS)[number]) ? DEFAULT_THINKING_BUDGET : 0,
      },
    },
  }

  const { text } = await generateText({
    model,
    prompt,
    providerOptions,
  })
  return text
}
