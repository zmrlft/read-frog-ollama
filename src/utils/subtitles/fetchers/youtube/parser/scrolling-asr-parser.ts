import type { SubtitlesFragment } from '../../../types'
import type { YoutubeTimedText } from '../types'
import { MAX_WORDS, SENTENCE_END_PATTERN } from '@/utils/constants/subtitles'

const ESTIMATED_WORD_DURATION_MS = 200

function isSpecialTag(text: string): boolean {
  return text.startsWith('[') && text.endsWith(']')
}

function getWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function pushFragment(result: SubtitlesFragment[], fragment: SubtitlesFragment) {
  // Fix previous fragment's end time to avoid overlap
  const last = result[result.length - 1]
  if (last && last.end > fragment.start) {
    last.end = fragment.start
  }
  result.push(fragment)
}

/**
 * Parse ASR scrolling subtitle format
 * 1. Skip separators (aAppend: 1)
 * 2. Split at sentence boundaries (.?!) or when word count exceeds limit
 * 3. Filter special tags
 */
export function parseScrollingAsrSubtitles(events: YoutubeTimedText[]): SubtitlesFragment[] {
  const result: SubtitlesFragment[] = []

  for (const event of events) {
    // Skip separators
    if (event.aAppend === 1)
      continue
    if (!event.segs || event.segs.length === 0)
      continue

    let currentText = ''
    let currentStart = event.tStartMs
    let lastSegEnd = event.tStartMs

    for (const seg of event.segs) {
      const text = seg.utf8 || ''
      const offsetMs = seg.tOffsetMs || 0
      const segStart = event.tStartMs + offsetMs

      currentText += text
      lastSegEnd = segStart + ESTIMATED_WORD_DURATION_MS

      // Split at sentence boundaries or when word count exceeds limit
      const shouldSplit
        = SENTENCE_END_PATTERN.test(text.trim())
          || getWordCount(currentText) >= MAX_WORDS

      if (shouldSplit) {
        const trimmed = currentText.trim()
        if (trimmed && !isSpecialTag(trimmed)) {
          pushFragment(result, {
            text: trimmed,
            start: currentStart,
            end: lastSegEnd,
          })
        }
        // Reset for next fragment
        currentText = ''
        currentStart = lastSegEnd
      }
    }

    // Handle remaining text in the event
    if (currentText.trim()) {
      const trimmed = currentText.trim()
      if (!isSpecialTag(trimmed)) {
        pushFragment(result, {
          text: trimmed,
          start: currentStart,
          end: event.tStartMs + (event.dDurationMs || 0),
        })
      }
    }
  }

  return result
}
