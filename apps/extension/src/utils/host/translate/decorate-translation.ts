import type { TranslationNodeStyle } from '@/types/config/translate'
import { camelCase } from 'case-anything'
import { translationNodeStyleSchema } from '@/types/config/translate'
import { CUSTOM_TRANSLATION_NODE_ATTRIBUTE } from '@/utils/constants/translation-node-style'

const customTranslationNodeAttribute = camelCase(CUSTOM_TRANSLATION_NODE_ATTRIBUTE)

export function decorateTranslationNode(translatedNode: HTMLElement, translationNodeStyle: TranslationNodeStyle) {
  const customNodeStyle = translationNodeStyle

  if (translationNodeStyleSchema.safeParse(customNodeStyle).error)
    return

  translatedNode.dataset[customTranslationNodeAttribute] = customNodeStyle
}
