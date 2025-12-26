import type { YoutubeTimedText } from '../fetchers/youtube/types'
import { describe, expect, it } from 'vitest'
import { detectFormat } from '../fetchers/youtube/format-detector'
import { parseKaraokeSubtitles } from '../fetchers/youtube/parser/karaoke-parser'
import { parseScrollingAsrSubtitles } from '../fetchers/youtube/parser/scrolling-asr-parser'
import { optimizeSubtitles } from '../processor/optimizer'

describe('youTube Subtitle Parsers', () => {
  describe('format Detection', () => {
    it('should detect karaoke format (multiple wpWinPosId at same timestamp)', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 1, segs: [{ utf8: 'あ' }] },
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 2, segs: [{ utf8: 'a' }] },
      ]
      expect(detectFormat(events)).toBe('karaoke')
    })

    it('should detect scrolling-asr format (wWinId + aAppend: 1)', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, wWinId: 1, segs: [{ utf8: 'Hello' }] },
        { tStartMs: 2000, dDurationMs: 1000, wWinId: 1, aAppend: 1, segs: [{ utf8: '\n' }] },
      ]
      expect(detectFormat(events)).toBe('scrolling-asr')
    })

    it('should default to standard format', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, segs: [{ utf8: 'Hello' }] },
        { tStartMs: 3000, dDurationMs: 2000, segs: [{ utf8: 'World' }] },
      ]
      expect(detectFormat(events)).toBe('standard')
    })

    it('should return standard for empty events', () => {
      expect(detectFormat([])).toBe('standard')
    })
  })

  describe('karaoke Parser', () => {
    it('should select main track (prefer wpWinPosId: 3)', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 1, segs: [{ utf8: 'ruby' }] },
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 3, segs: [{ utf8: '漢字' }] },
      ]
      const result = parseKaraokeSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('漢字')
    })

    it('should use largest wpWinPosId if 3 is not available', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 1, segs: [{ utf8: 'small' }] },
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 5, segs: [{ utf8: 'large' }] },
      ]
      const result = parseKaraokeSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('large')
    })

    it('should merge segs within event', () => {
      const events: YoutubeTimedText[] = [
        {
          tStartMs: 1000,
          dDurationMs: 3000,
          wpWinPosId: 3,
          segs: [{ utf8: '今日' }, { utf8: 'は' }, { utf8: '晴れ' }],
        },
      ]
      const result = parseKaraokeSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('今日は晴れ')
      expect(result[0].start).toBe(1000)
      expect(result[0].end).toBe(4000)
    })

    it('should fix overlap between fragments', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 5000, wpWinPosId: 3, segs: [{ utf8: 'First' }] },
        { tStartMs: 2000, dDurationMs: 3000, wpWinPosId: 3, segs: [{ utf8: 'Second' }] },
      ]
      const result = parseKaraokeSubtitles(events)

      expect(result).toHaveLength(2)
      expect(result[0].end).toBe(2000) // Fixed from 6000 to 2000
      expect(result[1].start).toBe(2000)
    })

    it('should deduplicate adjacent identical text', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 1000, wpWinPosId: 3, segs: [{ utf8: 'Same' }] },
        { tStartMs: 2000, dDurationMs: 1000, wpWinPosId: 3, segs: [{ utf8: 'Same' }] },
        { tStartMs: 3000, dDurationMs: 1000, wpWinPosId: 3, segs: [{ utf8: 'Different' }] },
      ]
      const result = parseKaraokeSubtitles(events)

      expect(result).toHaveLength(2)
      expect(result[0].text).toBe('Same')
      expect(result[0].start).toBe(1000)
      expect(result[0].end).toBe(3000) // Merged time range
      expect(result[1].text).toBe('Different')
    })

    it('should clean zero-width spaces', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 3, segs: [{ utf8: 'Hello\u200BWorld' }] },
      ]
      const result = parseKaraokeSubtitles(events)

      expect(result[0].text).toBe('HelloWorld')
    })

    it('should skip empty segs', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 3, segs: [] },
        { tStartMs: 3000, dDurationMs: 2000, wpWinPosId: 3, segs: [{ utf8: 'Valid' }] },
      ]
      const result = parseKaraokeSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Valid')
    })

    it('should skip events with only whitespace', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, wpWinPosId: 3, segs: [{ utf8: '   ' }] },
        { tStartMs: 3000, dDurationMs: 2000, wpWinPosId: 3, segs: [{ utf8: 'Valid' }] },
      ]
      const result = parseKaraokeSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Valid')
    })
  })

  describe('scrolling ASR Parser', () => {
    it('should skip separator events (aAppend: 1)', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, wWinId: 1, segs: [{ utf8: 'First' }] },
        { tStartMs: 3000, dDurationMs: 500, wWinId: 1, aAppend: 1, segs: [{ utf8: '\n' }] },
        { tStartMs: 3500, dDurationMs: 2000, wWinId: 1, segs: [{ utf8: 'Second' }] },
      ]
      const result = parseScrollingAsrSubtitles(events)

      expect(result).toHaveLength(2)
      expect(result[0].text).toBe('First')
      expect(result[1].text).toBe('Second')
    })

    it('should filter special tags [Music] [Applause]', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, segs: [{ utf8: '[Music]' }] },
        { tStartMs: 3000, dDurationMs: 2000, segs: [{ utf8: 'Hello' }] },
        { tStartMs: 5000, dDurationMs: 2000, segs: [{ utf8: '[Applause]' }] },
      ]
      const result = parseScrollingAsrSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Hello')
    })

    it('should fix overlap between fragments', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 15000, segs: [{ utf8: 'First sentence' }] },
        { tStartMs: 5000, dDurationMs: 10000, segs: [{ utf8: 'Second sentence' }] },
      ]
      const result = parseScrollingAsrSubtitles(events)

      expect(result).toHaveLength(2)
      expect(result[0].end).toBe(5000) // Fixed from 16000 to 5000
      expect(result[1].start).toBe(5000)
    })

    it('should handle missing dDurationMs', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 0, segs: [{ utf8: 'Hello' }] },
      ]
      const result = parseScrollingAsrSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].end).toBe(1000)
    })

    it('should merge segs within event', () => {
      const events: YoutubeTimedText[] = [
        {
          tStartMs: 1000,
          dDurationMs: 3000,
          segs: [{ utf8: 'Hello ' }, { utf8: 'World' }],
        },
      ]
      const result = parseScrollingAsrSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Hello World')
    })

    it('should skip events with empty segs', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, segs: [] },
        { tStartMs: 3000, dDurationMs: 2000, segs: [{ utf8: 'Valid' }] },
      ]
      const result = parseScrollingAsrSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Valid')
    })

    it('should skip events with only whitespace', () => {
      const events: YoutubeTimedText[] = [
        { tStartMs: 1000, dDurationMs: 2000, segs: [{ utf8: '   ' }] },
        { tStartMs: 3000, dDurationMs: 2000, segs: [{ utf8: 'Valid' }] },
      ]
      const result = parseScrollingAsrSubtitles(events)

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Valid')
    })
  })

  describe('standard Format + Optimizer', () => {
    it('should merge consecutive fragments', () => {
      const fragments = [
        { text: 'Hello', start: 0, end: 500 },
        { text: 'world.', start: 500, end: 1000 },
      ]
      const result = optimizeSubtitles(fragments, 'en')

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Hello world.')
    })

    it('should split on sentence boundaries', () => {
      const fragments = [
        { text: 'First sentence.', start: 0, end: 1000 },
        { text: 'Second sentence.', start: 1000, end: 2000 },
      ]
      const result = optimizeSubtitles(fragments, 'en')

      expect(result).toHaveLength(2)
      expect(result[0].text).toBe('First sentence.')
      expect(result[1].text).toBe('Second sentence.')
    })

    it('should split on timeout (gap > 1000ms)', () => {
      const fragments = [
        { text: 'First part', start: 0, end: 1000 },
        { text: 'Second part', start: 2500, end: 3500 },
      ]
      const result = optimizeSubtitles(fragments, 'en')

      expect(result).toHaveLength(2)
    })

    it('should handle CJK languages (no space separator)', () => {
      const fragments = [
        { text: '今日は', start: 0, end: 500 },
        { text: '晴れです。', start: 500, end: 1000 },
      ]
      const result = optimizeSubtitles(fragments, 'ja')

      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('今日は晴れです。')
    })

    it('should split Chinese on timeout', () => {
      const fragments = [
        { text: '你好', start: 0, end: 500 },
        { text: '很高兴认识你', start: 2000, end: 3000 }, // gap > 1000ms
      ]
      const result = optimizeSubtitles(fragments, 'zh')

      expect(result).toHaveLength(2)
      expect(result[0].text).toBe('你好')
      expect(result[1].text).toBe('很高兴认识你')
    })

    it('should return empty array for empty input', () => {
      const result = optimizeSubtitles([], 'en')
      expect(result).toEqual([])
    })
  })
})
