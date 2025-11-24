import type { LangCodeISO6393 } from '@read-frog/definitions'
import { Readability } from '@mozilla/readability'
import { LANG_CODE_TO_EN_NAME, langCodeISO6393Schema } from '@read-frog/definitions'
import { generateText } from 'ai'
import { franc } from 'franc-min'
import z from 'zod'
import { flattenToParagraphs } from '@/entrypoints/side.content/utils/article'
import { isLLMTranslateProviderConfig } from '@/types/config/provider'
import { isDontWalkIntoButTranslateAsChildElement, isHTMLElement } from '@/utils/host/dom/filter'
import { getConfigFromStorage } from './config/config'
import { getProviderConfigById } from './config/helpers'
import { getProviderOptions } from './constants/model'
import { logger } from './logger'
import { getTranslateModelById } from './providers/model'

type DetectionSource = 'llm' | 'franc' | 'fallback'

/**
 * get the favicon url
 * @return {string} favicon url
 */
export function getFaviconUrl(): string {
  // 优先级列表：常见 rel 属性
  const relList = [
    'icon',
    'shortcut icon',
    'apple-touch-icon',
    'apple-touch-icon-precomposed',
    'mask-icon',
  ]

  const candidates: { url: string, size: number, type: string }[] = []

  for (const rel of relList) {
    const links = document.head.querySelectorAll(
      `link[rel="${rel}"]`,
    ) as NodeListOf<HTMLLinkElement>

    links.forEach((link) => {
      if (link.href) {
        const size
          = link.sizes.length > 0
            ? Math.max(...Array.from(link.sizes).map(s => Number.parseInt(s) || 0))
            : 0

        candidates.push({
          url: link.href,
          size,
          type: link.type || '',
        })
      }
    })
  }

  // 按以下优先级排序：
  // 1. 更大的尺寸优先
  // 2. SVG 格式优先（通常更清晰）
  // 3. PNG 格式优先于 ICO
  candidates.sort((a, b) => {
    if (a.size !== b.size)
      return b.size - a.size
    if (a.type === 'image/svg+xml' && b.type !== 'image/svg+xml')
      return -1
    if (b.type === 'image/svg+xml' && a.type !== 'image/svg+xml')
      return 1
    if (a.type === 'image/png' && b.type === 'image/x-icon')
      return -1
    if (b.type === 'image/png' && a.type === 'image/x-icon')
      return 1
    return 0
  })

  // 如果找到了候选图标，返回最优的那个
  if (candidates.length > 0) {
    return candidates[0].url
  }

  // 如果依然没找到，就回退到站点根目录的 /favicon.ico
  const { origin } = window.location
  return `${origin}/favicon.ico`
}

function removeDummyNodes(root: Document) {
  const elements = root.querySelectorAll('*')
  elements.forEach((element) => {
    if (isHTMLElement(element) && isDontWalkIntoButTranslateAsChildElement(element)) {
      element.remove()
    }
  })
}

export async function getDocumentInfo(): Promise<{
  article: ReturnType<Readability<Node>['parse']>
  paragraphs: string[]
  detectedCodeOrUnd: LangCodeISO6393 | 'und'
  detectionSource: DetectionSource
}> {
  const documentClone = document.cloneNode(true)
  removeDummyNodes(documentClone as Document)
  const article = new Readability(documentClone as Document, {
    serializer: el => el,
  }).parse()
  const paragraphs = article?.content
    ? flattenToParagraphs(article.content)
    : []

  logger.info('article', article)

  let detectedCodeOrUnd: LangCodeISO6393 | 'und' = 'und'
  let detectionSource: DetectionSource = 'fallback'

  // Get config to check if LLM detection is enabled
  const config = await getConfigFromStorage()

  // Try LLM detection first if enabled and auto-translate languages are configured
  if (config?.translate.page.enableLLMDetection && config?.translate.page.autoTranslateLanguages?.length > 0) {
    try {
      // Combine and truncate text for LLM detection
      // Keep full title, truncate content to ~1500 chars
      const title = article?.title || ''
      const content = article?.textContent || ''
      const MAX_CONTENT_LENGTH = 1500
      const truncatedContent = content.length > MAX_CONTENT_LENGTH
        ? content.slice(0, MAX_CONTENT_LENGTH)
        : content
      const textForLLM = `${title}\n\n${truncatedContent}`.trim()

      if (textForLLM) {
        const llmResult = await detectLanguageWithLLM(textForLLM)

        if (llmResult) {
          detectedCodeOrUnd = llmResult
          detectionSource = 'llm'
          logger.info(`Language detected by LLM: ${llmResult}`)
        }
      }
    }
    catch (error) {
      logger.error('LLM language detection failed, will fallback to franc:', error)
    }
  }

  // Fallback to franc only if LLM didn't succeed
  if (detectionSource !== 'llm') {
    const francInput = `${article?.title || ''} ${article?.textContent || ''}`.trim()
    if (francInput) {
      const francResult = franc(francInput)
      logger.info('franc result', francResult)

      detectedCodeOrUnd = francResult === 'und'
        ? 'und'
        : (francResult as LangCodeISO6393)
      detectionSource = francResult === 'und' ? 'fallback' : 'franc'
      logger.info(`Language detected by franc: ${francResult}`)
    }
  }

  logger.info('final detectionSource', detectionSource)
  logger.info('final detectedCodeOrUnd', detectedCodeOrUnd)

  return {
    article,
    paragraphs,
    detectedCodeOrUnd,
    detectionSource,
  }
}

/**
 * Detect language using LLM with retry logic
 * @param text - Text to analyze (caller is responsible for combining title and content)
 * @returns ISO 639-3 language code or null if all attempts fail (null = no LLM provider or all attempts failed)
 */
export async function detectLanguageWithLLM(
  text: string,
): Promise<LangCodeISO6393 | 'und' | null> {
  const MAX_ATTEMPTS = 3 // 1 original + 2 retries

  if (!text.trim()) {
    logger.warn('No text provided for language detection')
    return null
  }

  // Get model from config
  try {
    const config = await getConfigFromStorage()
    if (!config) {
      logger.warn('No config found for language detection')
      return null
    }

    const providerConfig = getProviderConfigById(
      config.providersConfig,
      config.translate.providerId,
    )

    if (!providerConfig || !isLLMTranslateProviderConfig(providerConfig)) {
      logger.info('No LLM translate provider configured')
      return null
    }

    const { models: { translate } } = providerConfig
    const translateModel = translate.isCustomModel ? translate.customModel : translate.model
    const providerOptions = getProviderOptions(translateModel ?? '')
    const model = await getTranslateModelById(providerConfig.id)

    // Create language list for prompt
    const languageList = Object.entries(LANG_CODE_TO_EN_NAME)
      .map(([code, name]) => `- ${code}: ${name}`)
      .join('\n')

    const prompt = `Detect the language of the following text and return ONLY the ISO 639-3 language code.

IMPORTANT: Return ONLY the language code (e.g., "eng" or "cmn" or "und"), nothing else. Do NOT include explanations, punctuation, or any other text.

Supported ISO 639-3 language codes:
${languageList}

If the language is not in the list above, return "und".

Text to analyze:
${text}

Remember: Return ONLY the ISO 639-3 code (3 lowercase letters or "und").`

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const { text: responseText } = await generateText({
          model,
          prompt,
          providerOptions,
        })

        // Clean the response (trim whitespace, quotes, newlines)
        const cleanedCode = responseText.trim().toLowerCase().replace(/['"`,.\s]/g, '')

        // Validate with Zod schema
        const parseResult = langCodeISO6393Schema.or(z.literal('und')).safeParse(cleanedCode)

        if (parseResult.success) {
          logger.info(`LLM language detection succeeded on attempt ${attempt}: ${parseResult.data}`)
          return parseResult.data
        }
        else {
          logger.warn(`LLM returned invalid language code on attempt ${attempt}: "${responseText}" (cleaned: "${cleanedCode}")`)
          // Don't throw, just continue to next attempt
        }
      }
      catch (error) {
        logger.error(`LLM language detection attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error)
      }

      if (attempt === MAX_ATTEMPTS) {
        logger.warn('All LLM language detection attempts failed')
        return null
      }
    }
  }
  catch (error) {
    logger.error('Failed to get model for language detection:', error)
    return null
  }

  return null
}
