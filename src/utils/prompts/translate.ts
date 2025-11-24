import { getConfigFromStorage } from '@/utils/config/config'
import { DEFAULT_CONFIG } from '../constants/config'
import { DEFAULT_BATCH_TRANSLATE_PROMPT, DEFAULT_TRANSLATE_PROMPT, getTokenCellText, INPUT, TARGET_LANG } from '../constants/prompt'

export async function getTranslatePrompt(
  targetLang: string,
  input: string,
  options?: { isBatch?: boolean },
) {
  const config = await getConfigFromStorage() ?? DEFAULT_CONFIG
  const customPromptsConfig = config.translate.customPromptsConfig
  const { patterns = [], promptId } = customPromptsConfig

  // If no custom prompt selected, use default constant
  let prompt: string
  if (!promptId) {
    prompt = DEFAULT_TRANSLATE_PROMPT
  }
  else {
    // Find custom prompt, fallback to default
    const customPrompt = patterns.find(pattern => pattern.id === promptId)
    prompt = customPrompt?.prompt ?? DEFAULT_TRANSLATE_PROMPT
  }

  if (options?.isBatch) {
    prompt = `
${prompt}

${DEFAULT_BATCH_TRANSLATE_PROMPT}
`
  }

  return prompt
    .replaceAll(getTokenCellText(TARGET_LANG), targetLang)
    .replaceAll(getTokenCellText(INPUT), input)
}
