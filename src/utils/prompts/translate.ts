import type { ArticleContent } from '@/types/content'
import { getConfigFromStorage } from '@/utils/config/config'
import { DEFAULT_CONFIG } from '../constants/config'
import { DEFAULT_BATCH_TRANSLATE_PROMPT, DEFAULT_TRANSLATE_PROMPT, getTokenCellText, INPUT, SUMMARY, TARGET_LANG, TITLE } from '../constants/prompt'

export interface TranslatePromptOptions {
  isBatch?: boolean
  content?: ArticleContent
}

export async function getTranslatePrompt(
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions,
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

  // Build title and summary replacement values
  const title = options?.content?.title ?? ''
  const summary = options?.content?.summary ?? ''

  return prompt
    .replaceAll(getTokenCellText(TARGET_LANG), targetLang)
    .replaceAll(getTokenCellText(INPUT), input)
    .replaceAll(getTokenCellText(TITLE), title)
    .replaceAll(getTokenCellText(SUMMARY), summary)
}
