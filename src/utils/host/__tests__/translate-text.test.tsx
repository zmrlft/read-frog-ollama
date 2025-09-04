import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CONFIG } from '@/utils/constants/config'
import { translateText } from '@/utils/host/translate/translate-text'

// Mock dependencies
vi.mock('@/utils/config/config', () => ({
  globalConfig: DEFAULT_CONFIG,
}))

vi.mock('@/utils/message', () => ({
  sendMessage: vi.fn(),
}))

let mockSendMessage: any

describe('translate-text', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockSendMessage = vi.mocked((await import('@/utils/message')).sendMessage)
  })

  describe('translateText', () => {
    it('should return empty string for empty/whitespace input', async () => {
      expect(await translateText('')).toBe('')
      expect(await translateText(' ')).toBe('')
      expect(await translateText('\n')).toBe('')
      expect(await translateText(' \n ')).toBe('')
      expect(await translateText(' \n \t')).toBe('')
    })

    it('should handle zero-width spaces correctly', async () => {
      // Only zero-width spaces
      expect(await translateText('\u200B\u200B')).toBe('')

      // Mixed invisible + whitespace
      expect(await translateText('\u200B \u200B')).toBe('')

      // Should still translate valid content with zero-width spaces
      mockSendMessage.mockResolvedValue('你好')
      const result = await translateText('\u200B hello \u200B')
      expect(result).toBe('你好')
      expect(mockSendMessage).toHaveBeenCalledWith('enqueueRequest', expect.objectContaining({
        params: expect.objectContaining({
          text: 'hello',
        }),
      }))
    })

    it('should return empty string when translation equals source text', async () => {
      mockSendMessage.mockResolvedValue('test')

      const result = await translateText('test')

      expect(result).toBe('')
    })

    it('should handle whitespace and trim result', async () => {
      mockSendMessage.mockResolvedValue('  测试结果  ')

      const result = await translateText('test input')

      expect(result).toBe('测试结果')
    })
  })
})
