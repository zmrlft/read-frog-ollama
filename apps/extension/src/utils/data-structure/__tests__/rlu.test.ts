import { beforeEach, describe, expect, it } from 'vitest'
import { LRUCache } from '../rlu'

describe('lRUCache', () => {
  let cache: LRUCache<string, number>

  beforeEach(() => {
    cache = new LRUCache<string, number>(3)
  })

  describe('constructor', () => {
    it('should create an empty cache with specified max size', () => {
      const newCache = new LRUCache<string, number>(5)
      expect(newCache.size).toBe(0)
    })

    it('should handle max size of 1', () => {
      const smallCache = new LRUCache<string, number>(1)
      expect(smallCache.size).toBe(0)
    })

    it('should handle max size of 0', () => {
      const zeroCache = new LRUCache<string, number>(0)
      expect(zeroCache.size).toBe(0)
    })
  })

  describe('set and get', () => {
    it('should set and get a single value', () => {
      cache.set('key1', 1)
      expect(cache.get('key1')).toBe(1)
      expect(cache.size).toBe(1)
    })

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should handle multiple key-value pairs within capacity', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)
      cache.set('key3', 3)

      expect(cache.get('key1')).toBe(1)
      expect(cache.get('key2')).toBe(2)
      expect(cache.get('key3')).toBe(3)
      expect(cache.size).toBe(3)
    })

    it('should update existing key without changing size', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)
      cache.set('key1', 10) // Update existing key

      expect(cache.get('key1')).toBe(10)
      expect(cache.size).toBe(2)
    })
  })

  describe('lRU eviction behavior', () => {
    it('should evict least recently used item when capacity is exceeded', () => {
      cache.set('key1', 1) // oldest
      cache.set('key2', 2)
      cache.set('key3', 3)
      cache.set('key4', 4) // should evict key1

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe(2)
      expect(cache.get('key3')).toBe(3)
      expect(cache.get('key4')).toBe(4)
      expect(cache.size).toBe(3)
    })

    it('should update access order when getting an item', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)
      cache.set('key3', 3)

      // Access key1 to make it most recently used
      cache.get('key1')

      // Add another item - key2 should be evicted (oldest after key1 access)
      cache.set('key4', 4)

      expect(cache.get('key1')).toBe(1) // Still present due to recent access
      expect(cache.get('key2')).toBeUndefined() // Evicted
      expect(cache.get('key3')).toBe(3)
      expect(cache.get('key4')).toBe(4)
    })

    it('should update access order when setting an existing key', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)
      cache.set('key3', 3)

      // Update key1 to make it most recently used
      cache.set('key1', 10)

      // Add another item - key2 should be evicted
      cache.set('key4', 4)

      expect(cache.get('key1')).toBe(10) // Still present with updated value
      expect(cache.get('key2')).toBeUndefined() // Evicted
      expect(cache.get('key3')).toBe(3)
      expect(cache.get('key4')).toBe(4)
    })
  })

  describe('delete', () => {
    it('should delete existing key and return true', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)

      const result = cache.delete('key1')

      expect(result).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe(2)
      expect(cache.size).toBe(1)
    })

    it('should return false when deleting non-existent key', () => {
      cache.set('key1', 1)

      const result = cache.delete('nonexistent')

      expect(result).toBe(false)
      expect(cache.size).toBe(1)
    })

    it('should handle deleting from empty cache', () => {
      const result = cache.delete('key1')

      expect(result).toBe(false)
      expect(cache.size).toBe(0)
    })
  })

  describe('clear', () => {
    it('should clear all items from cache', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)
      cache.set('key3', 3)

      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBeUndefined()
    })

    it('should handle clearing empty cache', () => {
      cache.clear()
      expect(cache.size).toBe(0)
    })
  })

  describe('size property', () => {
    it('should return correct size as items are added', () => {
      expect(cache.size).toBe(0)

      cache.set('key1', 1)
      expect(cache.size).toBe(1)

      cache.set('key2', 2)
      expect(cache.size).toBe(2)

      cache.set('key3', 3)
      expect(cache.size).toBe(3)
    })

    it('should maintain max size when evicting items', () => {
      cache.set('key1', 1)
      cache.set('key2', 2)
      cache.set('key3', 3)
      cache.set('key4', 4) // Should evict key1

      expect(cache.size).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should handle cache with max size 1', () => {
      const smallCache = new LRUCache<string, number>(1)

      smallCache.set('key1', 1)
      expect(smallCache.get('key1')).toBe(1)
      expect(smallCache.size).toBe(1)

      smallCache.set('key2', 2) // Should evict key1
      expect(smallCache.get('key1')).toBeUndefined()
      expect(smallCache.get('key2')).toBe(2)
      expect(smallCache.size).toBe(1)
    })

    it('should handle cache with max size 0', () => {
      const zeroCache = new LRUCache<string, number>(0)

      zeroCache.set('key1', 1) // Should immediately evict
      expect(zeroCache.get('key1')).toBeUndefined()
      expect(zeroCache.size).toBe(0)
    })

    it('should handle different key and value types', () => {
      const stringCache = new LRUCache<number, string>(2)

      stringCache.set(1, 'one')
      stringCache.set(2, 'two')

      expect(stringCache.get(1)).toBe('one')
      expect(stringCache.get(2)).toBe('two')

      stringCache.set(3, 'three')
      expect(stringCache.get(1)).toBeUndefined()
      expect(stringCache.get(2)).toBe('two')
      expect(stringCache.get(3)).toBe('three')
    })

    it('should handle object keys and values', () => {
      const objCache = new LRUCache<object, object>(2)
      const key1 = { id: 1 }
      const key2 = { id: 2 }
      const val1 = { data: 'first' }
      const val2 = { data: 'second' }

      objCache.set(key1, val1)
      objCache.set(key2, val2)

      expect(objCache.get(key1)).toBe(val1)
      expect(objCache.get(key2)).toBe(val2)
    })

    it('should handle null and undefined values', () => {
      const nullCache = new LRUCache<string, null | undefined>(3)

      nullCache.set('null', null)
      nullCache.set('undefined', undefined)

      expect(nullCache.get('null')).toBe(null)
      expect(nullCache.get('undefined')).toBe(undefined)
      expect(nullCache.get('nonexistent')).toBe(undefined)
      expect(nullCache.size).toBe(2)
    })
  })

  describe('complex scenarios', () => {
    it('should maintain correct order with mixed operations', () => {
      // Fill cache
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // Access 'a' to make it most recent
      cache.get('a')

      // Update 'b' to make it most recent
      cache.set('b', 20)

      // Current order (most to least recent): b, a, c
      // Add new item - 'c' should be evicted
      cache.set('d', 4)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(20)
      expect(cache.get('c')).toBeUndefined()
      expect(cache.get('d')).toBe(4)
    })

    it('should handle rapid additions and evictions', () => {
      const largeCache = new LRUCache<number, number>(100)

      // Add 150 items
      for (let i = 0; i < 150; i++) {
        largeCache.set(i, i * 2)
      }

      expect(largeCache.size).toBe(100)

      // First 50 items should be evicted
      for (let i = 0; i < 50; i++) {
        expect(largeCache.get(i)).toBeUndefined()
      }

      // Last 100 items should still be present
      for (let i = 50; i < 150; i++) {
        expect(largeCache.get(i)).toBe(i * 2)
      }
    })
  })
})
