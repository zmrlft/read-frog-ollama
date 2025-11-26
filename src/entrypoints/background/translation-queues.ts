import type { Config } from '@/types/config/config'
import type { LLMTranslateProviderConfig, ProviderConfig } from '@/types/config/provider'
import type { ArticleContent } from '@/types/content'
import { isLLMTranslateProviderConfig } from '@/types/config/provider'
import { putBatchRequestRecord } from '@/utils/batch-request-record'
import { DEFAULT_CONFIG } from '@/utils/constants/config'
import { BATCH_SEPARATOR } from '@/utils/constants/prompt'
import { generateArticleSummary } from '@/utils/content/summary'
import { cleanText } from '@/utils/content/utils'
import { db } from '@/utils/db/dexie/db'
import { Sha256Hex } from '@/utils/hash'
import { executeTranslate } from '@/utils/host/translate/execute-translate'
import { logger } from '@/utils/logger'
import { onMessage } from '@/utils/message'
import { BatchQueue } from '@/utils/request/batch-queue'
import { RequestQueue } from '@/utils/request/request-queue'
import { ensureInitializedConfig } from './config'

export function parseBatchResult(result: string): string[] {
  return result.split(BATCH_SEPARATOR).map(t => t.trim())
}

interface TranslateBatchData {
  text: string
  langConfig: Config['language']
  providerConfig: ProviderConfig
  hash: string
  scheduleAt: number
  content?: ArticleContent
}

export async function setUpRequestQueue() {
  const config = await ensureInitializedConfig()
  const { translate: { requestQueueConfig: { rate, capacity }, batchQueueConfig: { maxCharactersPerBatch, maxItemsPerBatch } } } = config ?? DEFAULT_CONFIG

  const requestQueue = new RequestQueue({
    rate,
    capacity,
    timeoutMs: 20_000,
    maxRetries: 2,
    baseRetryDelayMs: 1_000,
  })

  /**
   * Get cached summary or generate a new one (using requestQueue for deduplication)
   */
  async function getOrGenerateSummary(
    articleTitle: string,
    articleTextContent: string,
    providerConfig: LLMTranslateProviderConfig,
  ): Promise<string | undefined> {
    // Prepare text for cache key
    const preparedText = cleanText(articleTextContent)
    if (!preparedText) {
      return undefined
    }

    // Generate cache key from text content hash and provider config
    const textHash = Sha256Hex(preparedText)
    const cacheKey = Sha256Hex(textHash, JSON.stringify(providerConfig))

    // Check cache first
    const cached = await db.articleSummaryCache.get(cacheKey)
    if (cached) {
      logger.info('Using cached article summary')
      return cached.summary
    }

    // Use requestQueue to deduplicate concurrent summary generation requests
    const thunk = async () => {
      // Double-check cache inside thunk (another request might have cached it)
      const cachedAgain = await db.articleSummaryCache.get(cacheKey)
      if (cachedAgain) {
        return cachedAgain.summary
      }

      // Generate new summary
      const summary = await generateArticleSummary(articleTitle, articleTextContent, providerConfig)
      if (!summary) {
        return ''
      }

      // Cache the summary
      await db.articleSummaryCache.put({
        key: cacheKey,
        summary,
        createdAt: new Date(),
      })

      logger.info('Generated and cached new article summary')
      return summary
    }

    try {
      const summary = await requestQueue.enqueue(thunk, Date.now(), cacheKey)
      return summary || undefined
    }
    catch (error) {
      logger.warn('Failed to get/generate article summary:', error)
      return undefined
    }
  }

  const batchQueue = new BatchQueue<TranslateBatchData, string>({
    maxCharactersPerBatch,
    maxItemsPerBatch,
    batchDelay: 100,
    maxRetries: 3,
    enableFallbackToIndividual: true,
    getBatchKey: (data) => {
      return Sha256Hex(`${data.langConfig.sourceCode}-${data.langConfig.targetCode}-${data.providerConfig.id}`)
    },
    getCharacters: (data) => {
      return data.text.length
    },
    executeBatch: async (dataList) => {
      const { langConfig, providerConfig, content } = dataList[0]
      const texts = dataList.map(d => d.text)
      const batchText = texts.join(`\n\n${BATCH_SEPARATOR}\n\n`)
      const hash = Sha256Hex(...dataList.map(d => d.hash))
      const earliestScheduleAt = Math.min(...dataList.map(d => d.scheduleAt))

      const batchThunk = async (): Promise<string[]> => {
        await putBatchRequestRecord({ originalRequestCount: dataList.length, providerConfig })
        const result = await executeTranslate(batchText, langConfig, providerConfig, { isBatch: true, content })
        return parseBatchResult(result)
      }

      return requestQueue.enqueue(batchThunk, earliestScheduleAt, hash)
    },
    executeIndividual: async (data) => {
      const { text, langConfig, providerConfig, hash, scheduleAt, content } = data
      const thunk = async () => {
        await putBatchRequestRecord({ originalRequestCount: 1, providerConfig })
        return executeTranslate(text, langConfig, providerConfig, { content })
      }
      return requestQueue.enqueue(thunk, scheduleAt, hash)
    },
    onError: (error, context) => {
      const errorType = context.isFallback ? 'Individual request' : 'Batch request'
      logger.error(
        `${errorType} failed (batchKey: ${context.batchKey}, retry: ${context.retryCount}):`,
        error.message,
      )
    },
  })

  onMessage('enqueueTranslateRequest', async (message) => {
    const { data: { text, langConfig, providerConfig, scheduleAt, hash, articleTitle, articleTextContent } } = message

    // Check cache first
    if (hash) {
      const cached = await db.translationCache.get(hash)
      if (cached) {
        return cached.translation
      }
    }

    let result = ''
    const content: ArticleContent = {
      title: articleTitle || '',
    }

    if (isLLMTranslateProviderConfig(providerConfig)) {
      // Generate or fetch cached summary if AI Content Aware is enabled
      const config = await ensureInitializedConfig()
      if (config?.translate.enableAIContentAware && articleTitle !== undefined && articleTextContent !== undefined) {
        content.summary = await getOrGenerateSummary(articleTitle, articleTextContent, providerConfig)
      }

      const data = { text, langConfig, providerConfig, hash, scheduleAt, content }
      result = await batchQueue.enqueue(data)
    }
    else {
      // Create thunk based on type and params
      const thunk = () => executeTranslate(text, langConfig, providerConfig)
      result = await requestQueue.enqueue(thunk, scheduleAt, hash)
    }

    // Cache the translation result if successful
    if (result && hash) {
      await db.translationCache.put({
        key: hash,
        translation: result,
        createdAt: new Date(),
      })
    }

    return result
  })

  onMessage('setTranslateRequestQueueConfig', (message) => {
    const { data } = message
    requestQueue.setQueueOptions(data)
  })

  onMessage('setTranslateBatchQueueConfig', (message) => {
    const { data } = message
    batchQueue.setBatchConfig(data)
  })
}
