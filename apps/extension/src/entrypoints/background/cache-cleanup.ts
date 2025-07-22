import { browser } from '#imports'
import { db } from '@/utils/db/dexie/db'
import { logger } from '@/utils/logger'

const CACHE_CLEANUP_ALARM = 'cache-cleanup'
const CLEANUP_INTERVAL_MINUTES = 7 * 24 * 60
const CHECK_INTERVAL_MINUTES = 24 * 60

export function setupCacheCleanup() {
  // Set up periodic alarm for cache cleanup
  browser.alarms.create(CACHE_CLEANUP_ALARM, {
    delayInMinutes: 1,
    periodInMinutes: CHECK_INTERVAL_MINUTES,
  })

  // Listen for alarm events
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === CACHE_CLEANUP_ALARM) {
      await cleanupOldCache()
    }
  })

  // Also run cleanup immediately when background script starts
  cleanupOldCache().catch((error) => {
    logger.error('Failed to run initial cache cleanup:', error)
  })
}

async function cleanupOldCache() {
  try {
    const cutoffDate = new Date()
    cutoffDate.setTime(cutoffDate.getTime() - CLEANUP_INTERVAL_MINUTES * 60 * 1000)

    // Delete all cache entries older than the cutoff date
    const deletedCount = await db.translationCache
      .where('createdAt')
      .below(cutoffDate)
      .delete()

    if (deletedCount > 0) {
      logger.info(`Cache cleanup: Deleted ${deletedCount} old translation cache entries`)
    }
  }
  catch (error) {
    logger.error('Failed to cleanup old cache:', error)
  }
}
