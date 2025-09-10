import type { TranslationNodeStyle } from '@/types/config/translate'
import { camelCase } from 'case-anything'
import { translationNodeStyleSchema } from '@/types/config/translate'
import { globalConfig } from '@/utils/config/config'
import { CUSTOM_TRANSLATION_NODE_ATTRIBUTE } from '@/utils/constants/translation-node-style'

const customTranslationNodeAttribute = camelCase(CUSTOM_TRANSLATION_NODE_ATTRIBUTE)

export function decorateTranslationNode(translatedNode: HTMLElement, translationNodeStyle?: TranslationNodeStyle) {
  if (!globalConfig || !translatedNode)
    return

  const customNodeStyle = translationNodeStyle ?? globalConfig.translate.translationNodeStyle

  if (translationNodeStyleSchema.safeParse(customNodeStyle).error)
    return

  translatedNode.dataset[customTranslationNodeAttribute] = customNodeStyle
}
