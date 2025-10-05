import { storage } from '#imports'
import { sendMessage } from './message'

const LAST_VIEWED_BLOG_DATE_KEY = 'lastViewedBlogDate'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * Saves the last viewed blog date to Chrome storage
 */
export async function saveLastViewedBlogDate(date: Date): Promise<void> {
  await storage.setItem(`local:${LAST_VIEWED_BLOG_DATE_KEY}`, date.toISOString())
}

/**
 * Retrieves the last viewed blog date from Chrome storage
 */
export async function getLastViewedBlogDate(): Promise<Date | null> {
  const dateStr = await storage.getItem<string>(`local:${LAST_VIEWED_BLOG_DATE_KEY}`)
  return dateStr ? new Date(dateStr) : null
}

/**
 * Checks if there's a new blog post by comparing last viewed date with latest blog date
 */
export function hasNewBlogPost(lastViewedDate: Date | null, latestDate: Date | null): boolean {
  if (!latestDate)
    return false
  if (!lastViewedDate)
    return true
  return latestDate > lastViewedDate
}

/**
 * Fetches the latest blog post from the Read Frog blog API.
 * Uses background fetch with optional 1-day cache.
 *
 * @param apiUrl - The URL of the blog API endpoint (default: production URL)
 * @param locale - The locale to fetch the latest post for (default: 'en')
 * @param useCache - Whether to use cache (default: true)
 * @returns Promise resolving to the latest blog post date, or null if no posts found
 *
 * @example
 * ```ts
 * const latestDate = await getLatestBlogDate('http://localhost:8888/api/blog/latest', 'en')
 * console.log(latestDate) // Date object of the most recent post
 *
 * // Without cache
 * const freshDate = await getLatestBlogDate('http://localhost:8888/api/blog/latest', 'en', false)
 * ```
 */
export async function getLatestBlogDate(
  apiUrl: string = 'https://readfrog.app/api/blog/latest',
  locale: string = 'en',
  useCache: boolean = true,
): Promise<Date | null> {
  try {
    const url = new URL(apiUrl)
    url.searchParams.set('locale', locale)

    const response = await sendMessage('backgroundFetch', {
      url: url.toString(),
      method: 'GET',
      cacheConfig: useCache
        ? {
            enabled: true,
            groupKey: 'blog-fetch',
            ttl: ONE_DAY_MS,
          }
        : undefined,
    })

    if (response.status !== 200) {
      throw new Error(`Failed to fetch blog: ${response.status}`)
    }

    const data = JSON.parse(response.body) as {
      date: string
      title: string
      description: string
      url: string
    } | null

    if (!data) {
      return null
    }

    return new Date(data.date)
  }
  catch (error) {
    console.error('Error fetching latest blog post:', error)
    return null
  }
}
