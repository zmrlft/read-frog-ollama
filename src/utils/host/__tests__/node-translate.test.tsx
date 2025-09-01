// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CONFIG } from '@/utils/constants/config'
import { BLOCK_ATTRIBUTE, BLOCK_CONTENT_CLASS, CONTENT_WRAPPER_CLASS, PARAGRAPH_ATTRIBUTE } from '@/utils/constants/dom-labels'
import { removeOrShowNodeTranslation } from '../translate/node-manipulation'
import { expectNodeLabels, expectTranslatedContent, expectTranslationWrapper, MOCK_ORIGINAL_TEXT } from './utils'

vi.mock('@/utils/host/translate/translate-text', () => ({
  translateText: vi.fn(() => Promise.resolve('translation')),
  validateTranslationConfig: vi.fn(() => true),
}))

vi.mock('@/utils/config/config', () => ({
  globalConfig: DEFAULT_CONFIG,
}))

describe('node translation', () => {
  const originalGetComputedStyle = window.getComputedStyle

  beforeAll(() => {
    window.getComputedStyle = vi.fn((element) => {
      const originalStyle = originalGetComputedStyle(element)
      if (originalStyle.float === '') {
        Object.defineProperty(originalStyle, 'float', {
          value: 'none',
          writable: true,
          enumerable: true,
          configurable: true,
        })
      }
      return originalStyle
    })
  })

  afterAll(() => {
    window.getComputedStyle = originalGetComputedStyle
  })
  describe('show translation', () => {
    it('should show the translation when point is over the original text', async () => {
      render(
        <div data-testid="test-node">
          {MOCK_ORIGINAL_TEXT}
        </div>,
      )
      const node = screen.getByTestId('test-node')
      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = vi.fn(() => node)
      await act(async () => {
        await removeOrShowNodeTranslation({ x: 150, y: 125 }, 'bilingual')
      })

      expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
      const wrapper = expectTranslationWrapper(node, 'bilingual')
      expect(wrapper).toBe(node.childNodes[1])
      expectTranslatedContent(wrapper, BLOCK_CONTENT_CLASS)

      document.elementFromPoint = originalElementFromPoint
    })
  })
  describe('hide translation', () => {
    it('should hide the translation when point is over the translation content node', async () => {
      render(
        <div data-testid="test-node">
          {MOCK_ORIGINAL_TEXT}
        </div>,
      )
      const node = screen.getByTestId('test-node')

      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = vi.fn(() => node)
      await act(async () => {
        await removeOrShowNodeTranslation({ x: 150, y: 125 }, 'bilingual')
      })

      const translatedContent = node.querySelector(`.${BLOCK_CONTENT_CLASS}`)
      document.elementFromPoint = vi.fn(() => translatedContent as Element)
      await act(async () => {
        await removeOrShowNodeTranslation({ x: 150, y: 125 }, 'bilingual')
      })

      expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
      expect(node.textContent?.trim()).toBe(MOCK_ORIGINAL_TEXT)

      document.elementFromPoint = originalElementFromPoint
    })
    it('should hide the translation when point is over the translation wrapper', async () => {
      render(
        <div data-testid="test-node">
          {MOCK_ORIGINAL_TEXT}
        </div>,
      )
      const node = screen.getByTestId('test-node')
      const originalElementFromPoint = document.elementFromPoint
      document.elementFromPoint = vi.fn(() => node)
      await act(async () => {
        await removeOrShowNodeTranslation({ x: 150, y: 125 }, 'bilingual')
      })
      const wrapper = node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)
      document.elementFromPoint = vi.fn(() => wrapper as Element)
      await act(async () => {
        await removeOrShowNodeTranslation({ x: 150, y: 125 }, 'bilingual')
      })

      expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
      expect(node.textContent?.trim()).toBe(MOCK_ORIGINAL_TEXT)

      document.elementFromPoint = originalElementFromPoint
    })
  })
})
