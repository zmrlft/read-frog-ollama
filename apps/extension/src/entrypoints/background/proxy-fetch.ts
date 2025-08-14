import type { ProxyResponse } from '@/types/proxy-fetch'
import { browser } from '#imports'
import { AUTH_COOKIE_PATTERNS, AUTH_COOKIE_PREFIX, AUTH_DOMAINS } from '@repo/definitions'
import { DEFAULT_PROXY_CACHE_MAX_SIZE, DEFAULT_PROXY_CACHE_TTL_MS } from '@/utils/constants/proxy-fetch'
import { LRUCache } from '@/utils/data-structure/rlu'
import { logger } from '@/utils/logger'
import { onMessage } from '@/utils/message'

function makeCacheKey(reqMethod: string, targetUrl: string) {
  return `${reqMethod.toUpperCase()} ${targetUrl}`
}

export function proxyFetch() {
  // Two-level cache: groupKey -> LRUCache<requestKey, cachedItem>
  const cache: Map<string, LRUCache<string, { timestamp: number, response: ProxyResponse }>> = (globalThis as any).__rfProxyCache ?? ((globalThis as any).__rfProxyCache = new Map())

  // Global cache invalidation function
  function invalidateAllCache() {
    logger.info('[ProxyFetch] Invalidating all cache')
    cache.clear()
  }

  // Listen for cookie changes to invalidate auth-related cache
  if (browser.cookies && browser.cookies.onChanged) {
    browser.cookies.onChanged.addListener((changeInfo) => {
      const { cookie, removed } = changeInfo
      // Check if it's an auth-related cookie for monitored domains
      if (cookie.domain && AUTH_DOMAINS.some(domain => cookie.domain.includes(domain))) {
        // Check against defined auth cookie patterns
        if (AUTH_COOKIE_PATTERNS.some(name => cookie.name.includes(name)) || cookie.name.startsWith(AUTH_COOKIE_PREFIX)) {
          logger.info('[ProxyFetch] Auth cookie changed, invalidating cache:', {
            cookieName: cookie.name,
            domain: cookie.domain,
            removed,
          })
          invalidateAllCache()
        }
      }
    })
  }

  // Proxy cross-origin fetches for content scripts and other contexts
  onMessage('backgroundFetch', async (message): Promise<ProxyResponse> => {
    logger.info('[ProxyFetch] Background fetch:', message.data)

    const { url, method, headers, body, credentials, cacheConfig } = message.data

    const {
      enabled: cacheEnabled = false,
      groupKey: cacheGroupKey = 'default',
      ttl: cacheTtl = DEFAULT_PROXY_CACHE_TTL_MS,
      maxSize: cacheMaxSize = DEFAULT_PROXY_CACHE_MAX_SIZE,
    } = cacheConfig ?? {}

    function getCached(reqMethod: string, targetUrl: string): ProxyResponse | undefined {
      if (!cacheEnabled || !cacheGroupKey)
        return undefined

      const key = makeCacheKey(reqMethod, targetUrl)
      const group = cache.get(cacheGroupKey)
      if (!group)
        return undefined

      const item = group.get(key) // LRU automatically moves to end
      if (!item)
        return undefined

      if (Date.now() - item.timestamp > cacheTtl) {
        group.delete(key)
        return undefined
      }

      logger.info('[ProxyFetch] Return cached response:', { reqMethod, targetUrl })
      return item.response
    }

    function setCached(reqMethod: string, targetUrl: string, resp: ProxyResponse) {
      logger.info('[ProxyFetch] Set cached response:', { reqMethod, targetUrl })

      if (!cacheEnabled || !cacheGroupKey)
        return

      const key = makeCacheKey(reqMethod, targetUrl)
      let group = cache.get(cacheGroupKey)
      if (!group) {
        group = new LRUCache(cacheMaxSize)
        cache.set(cacheGroupKey, group)
      }

      // LRU automatically handles size limits and eviction
      group.set(key, { timestamp: Date.now(), response: resp })
    }

    function invalidateCache(groupKey?: string) {
      logger.info('[ProxyFetch] Invalidate cache:', { groupKey })
      if (groupKey) {
        cache.delete(groupKey)
      }
      else {
        cache.clear()
      }
    }

    const finalMethod = (method ?? 'GET').toUpperCase()

    // Check cache for GET requests
    if (finalMethod === 'GET' && cacheEnabled) {
      const cached = getCached(finalMethod, url)
      if (cached)
        return cached
    }

    // Aggressive mode: pre-clear cache before mutations to avoid race with subsequent GETs
    if (finalMethod !== 'GET') {
      invalidateCache(cacheGroupKey)
    }

    const response = await fetch(url, {
      method: finalMethod,
      headers: headers ? new Headers(headers) : undefined,
      body,
      credentials: credentials ?? 'include',
    })

    const responseHeaders: [string, string][] = Array.from(response.headers.entries())
    const textBody = await response.text()

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: textBody,
    }

    logger.info('[ProxyFetch] Response without cache:', result)

    // Handle caching based on response
    if (cacheEnabled) {
      if (finalMethod === 'GET') {
        // For auth requests: 401/403 implies session invalid -> clear cache
        if (result.status === 401 || result.status === 403) {
          invalidateCache(cacheGroupKey)
        }
        // Only cache successful GET responses
        else if (result.status >= 200 && result.status < 300) {
          setCached(finalMethod, url, result)
        }
      }
      else {
        // For auth mutations: only invalidate cache if mutation succeeded
        if (result.status >= 200 && result.status < 300) {
          invalidateCache(cacheGroupKey)
        }
      }
    }

    return result
  })
}
