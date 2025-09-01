// @vitest-environment jsdom
import type { TranslationMode } from '@/types/config/translate'
import { act, render, screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CONFIG } from '@/utils/constants/config'
import {
  BLOCK_ATTRIBUTE,
  BLOCK_CONTENT_CLASS,
  CONTENT_WRAPPER_CLASS,
  INLINE_ATTRIBUTE,
  INLINE_CONTENT_CLASS,
  PARAGRAPH_ATTRIBUTE,
} from '@/utils/constants/dom-labels'
import { walkAndLabelElement } from '@/utils/host/dom/traversal'
import { translateWalkedElement } from '@/utils/host/translate/node-manipulation'
import { translateText } from '@/utils/host/translate/translate-text'
import { expectNodeLabels, expectTranslatedContent, expectTranslationWrapper, MOCK_ORIGINAL_TEXT, MOCK_TRANSLATION } from './utils'

vi.mock('@/utils/host/translate/translate-text', () => ({
  translateText: vi.fn(() => Promise.resolve(MOCK_TRANSLATION)),
  validateTranslationConfig: vi.fn(() => true),
}))

vi.mock('@/utils/config/config', () => ({
  globalConfig: DEFAULT_CONFIG,
}))

describe('translate', () => {
  // Setup and teardown for getComputedStyle mock
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

  // Helper functions
  async function removeOrShowPageTranslation(translationMode: TranslationMode, toggle: boolean = false) {
    const id = crypto.randomUUID()

    walkAndLabelElement(document.body, id)
    await act(async () => {
      await translateWalkedElement(document.body, id, translationMode, toggle)
    })
  }

  describe('translateText stub', () => {
    it('translateText should be mocked', async () => {
      expect(await translateText('任何文字')).toBe(MOCK_TRANSLATION)
    })
  })

  describe('block node with single child node', () => {
    describe('text node', () => {
      it('bilingual mode: should insert translation wrapper after original text node', async () => {
        render(
          <div data-testid="test-node">
            {MOCK_ORIGINAL_TEXT}
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.childNodes[1])
        expectTranslatedContent(wrapper, BLOCK_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
      it('translation only mode: should replace original text with translation wrapper', async () => {
        render(
          <div data-testid="test-node">
            {MOCK_ORIGINAL_TEXT}
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
    })
    describe('inline HTML node', () => {
      it('bilingual mode: should insert translation wrapper after inline node content', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}>
              {MOCK_ORIGINAL_TEXT}
            </div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.childNodes[0].childNodes[1])
        expectTranslatedContent(wrapper, INLINE_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
      it('translation only mode: should replace inline node content with translation wrapper', async () => {
        render(
          <div data-testid="test-node">
            <span style={{ display: 'inline' }}>
              {MOCK_ORIGINAL_TEXT}
            </span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
    })
    describe('block node', () => {
      it('bilingual mode: should insert translation wrapper after child block node content', async () => {
        render(
          <div data-testid="test-node">
            <div>{MOCK_ORIGINAL_TEXT}</div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.childNodes[0].childNodes[1])
        expectTranslatedContent(wrapper, BLOCK_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
      it('translation only mode: should replace child block node content with translation wrapper', async () => {
        render(
          <div data-testid="test-node">
            <div>{MOCK_ORIGINAL_TEXT}</div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
    })
    describe('block node -> block node -> inline node', () => {
      it('bilingual mode: should insert translation wrapper after deepest inline node', async () => {
        render(
          <div data-testid="test-node">
            <div><span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span></div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0].childNodes[1])
        expectTranslatedContent(wrapper, INLINE_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
      it('translation only mode: should replace deepest inline node content with translation wrapper', async () => {
        render(
          <div data-testid="test-node">
            <div><span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span></div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
    })
    describe('block node -> shallow inline node (block node) -> block node', () => {
      it('bilingual mode: should insert translation wrapper after deepest block node content', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}><div>{MOCK_ORIGINAL_TEXT}</div></div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0].childNodes[1])
        expectTranslatedContent(wrapper, BLOCK_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
      it('translation only mode: should replace deepest block node content with translation wrapper', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}><div>{MOCK_ORIGINAL_TEXT}</div></div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
    })
    describe('block node -> shallow inline node -> inline node', () => {
      it('bilingual mode: should insert translation wrapper after nested inline node content', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}><span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span></div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0].childNodes[1])
        expectTranslatedContent(wrapper, INLINE_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
      it('translation only mode: should replace nested inline node content with translation wrapper', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}><span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span></div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
      })
    })
    describe('block node -> shallow inline node (inline node) -> inline node + inline node', () => {
      it('bilingual mode: should insert translation wrapper after parent inline node', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}>
              <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
              {MOCK_ORIGINAL_TEXT}
            </div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.childNodes[0].childNodes[2])
        expectTranslatedContent(wrapper, INLINE_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
      it('translation only mode: should replace parent inline node content with translation wrapper', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}>
              <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
              {MOCK_ORIGINAL_TEXT}
            </div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)

        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
    })
    describe('block node -> shallow inline node (block node) -> single inline node + block node', () => {
      it('bilingual mode: should insert separate wrappers for inline and block nodes', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}>
              <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
              <div>{MOCK_ORIGINAL_TEXT}</div>
            </div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper1 = expectTranslationWrapper(node.children[0].children[0], 'bilingual')
        expect(wrapper1).toBe(node.childNodes[0].childNodes[0].childNodes[1])
        expectTranslatedContent(wrapper1, INLINE_CONTENT_CLASS)
        expectNodeLabels(node.children[0].children[1], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper2 = expectTranslationWrapper(node.children[0].children[1], 'bilingual')
        expect(wrapper2).toBe(node.childNodes[0].childNodes[1].childNodes[1])
        expectTranslatedContent(wrapper2, BLOCK_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
      it('translation only mode: should replace inline and block nodes with separate wrappers', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}>
              <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
              <div>{MOCK_ORIGINAL_TEXT}</div>
            </div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper1 = expectTranslationWrapper(node.children[0].children[0], 'translationOnly')
        expect(wrapper1).toBe(node.childNodes[0].childNodes[0].childNodes[0])
        const wrapper2 = expectTranslationWrapper(node.children[0].children[1], 'translationOnly')
        expect(wrapper2).toBe(node.childNodes[0].childNodes[1].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
      })
    })
    describe('block node -> shallow inline node (block node) -> inline nodes + block node', () => {
      it('bilingual mode: should insert wrapper after inline group and inside block node', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}>
              <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
              <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
              <div>{MOCK_ORIGINAL_TEXT}</div>
            </div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0].children[1], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper1 = expectTranslationWrapper(node.children[0], 'bilingual')
        expect(wrapper1).toBe(node.childNodes[0].childNodes[2])
        expectTranslatedContent(wrapper1, INLINE_CONTENT_CLASS)
        const wrapper2 = expectTranslationWrapper(node.children[0].children[3], 'bilingual')
        expect(wrapper2).toBe(node.childNodes[0].childNodes[3].childNodes[1])
        expectTranslatedContent(wrapper2, BLOCK_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
      })
      it('translation only mode: should replace inline group and block node content with wrappers', async () => {
        render(
          <div data-testid="test-node">
            <div style={{ display: 'inline' }}>
              <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
              <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
              <div>{MOCK_ORIGINAL_TEXT}</div>
            </div>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper1 = expectTranslationWrapper(node.children[0], 'translationOnly')
        expect(wrapper1).toBe(node.childNodes[0].childNodes[0])
        const wrapper2 = expectTranslationWrapper(node.children[0].children[1], 'translationOnly')
        expect(wrapper2).toBe(node.childNodes[0].childNodes[1].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
      })
    })
  })

  describe('block node with multiple child nodes', () => {
    describe('all inline HTML nodes', () => {
      it('bilingual mode: should insert wrapper after the last inline node', async () => {
        render(
          <div data-testid="test-node">
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[1], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        expectNodeLabels(node.children[2], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])

        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.lastChild)
        expectTranslatedContent(wrapper, BLOCK_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })

      it('translation only mode: should replace all inline nodes with single wrapper', async () => {
        render(
          <div data-testid="test-node">
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
    })
    describe('text node and inline HTML nodes', () => {
      it('bilingual mode: should insert wrapper after the last inline node', async () => {
        render(
          <div data-testid="test-node">
            {MOCK_ORIGINAL_TEXT}
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            {MOCK_ORIGINAL_TEXT}
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.lastChild)
        expectTranslatedContent(wrapper, BLOCK_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
      it('translation only mode: should replace mixed text and inline nodes with single wrapper', async () => {
        render(
          <div data-testid="test-node">
            {MOCK_ORIGINAL_TEXT}
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            {MOCK_ORIGINAL_TEXT}
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
    })
    describe('inline nodes + block node + inline nodes', () => {
      it('bilingual mode: should insert three wrappers', async () => {
        render(
          <div data-testid="test-node">
            {MOCK_ORIGINAL_TEXT}
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            <div>{MOCK_ORIGINAL_TEXT}</div>
            {MOCK_ORIGINAL_TEXT}
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper1 = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper1).toBe(node.childNodes[2])
        expectTranslatedContent(wrapper1, INLINE_CONTENT_CLASS)
        const wrapper2 = expectTranslationWrapper(node.children[2], 'bilingual')
        expect(wrapper2).toBe(node.childNodes[3].childNodes[1])
        expectTranslatedContent(wrapper2, BLOCK_CONTENT_CLASS)
        const wrapper3 = node.lastChild
        expect(wrapper3).toHaveClass(CONTENT_WRAPPER_CLASS)
        expectTranslatedContent(wrapper3 as Element, INLINE_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
      it('translation only mode: should replace inline groups and block node with separate wrappers', async () => {
        render(
          <div data-testid="test-node">
            {MOCK_ORIGINAL_TEXT}
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            <div>{MOCK_ORIGINAL_TEXT}</div>
            {MOCK_ORIGINAL_TEXT}
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper1 = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper1).toBe(node.childNodes[0])
        const wrapper2 = expectTranslationWrapper(node.children[1], 'translationOnly')
        expect(wrapper2).toBe(node.childNodes[1].childNodes[0])
        const wrapper3 = node.lastChild
        expect(wrapper3).toHaveClass(CONTENT_WRAPPER_CLASS)

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
    })
    describe('floating inline HTML nodes', () => {
      it('bilingual mode: should insert wrapper after the last inline node', async () => {
        render(
          <div data-testid="test-node">
            <span style={{ float: 'left' }}>{MOCK_ORIGINAL_TEXT}</span>
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'bilingual')
        expect(wrapper).toBe(node.childNodes[2])
        expectTranslatedContent(wrapper, BLOCK_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
      it('translation only mode: should replace floating and inline nodes with single wrapper', async () => {
        render(
          <div data-testid="test-node">
            <span style={{ float: 'left' }}>{MOCK_ORIGINAL_TEXT}</span>
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper = expectTranslationWrapper(node, 'translationOnly')
        expect(wrapper).toBe(node.childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
    })
    describe('br dom between inline nodes', () => {
      it('bilingual mode: should insert separate wrappers for inline groups separated by br', async () => {
        render(
          <div data-testid="test-node">
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            <br />
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            {MOCK_ORIGINAL_TEXT}
            <br />
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('bilingual', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper1 = expectTranslationWrapper(node.children[0], 'bilingual')
        expect(wrapper1).toBe(node.childNodes[0].childNodes[1])
        expectTranslatedContent(wrapper1, INLINE_CONTENT_CLASS)
        expectNodeLabels(node.children[2], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper2 = node.children[3]
        expect(wrapper2).toHaveClass(CONTENT_WRAPPER_CLASS)
        expectTranslatedContent(wrapper2, INLINE_CONTENT_CLASS)
        expectNodeLabels(node.children[5], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper3 = expectTranslationWrapper(node.children[5], 'bilingual')
        expect(wrapper3).toBe(node.children[5].childNodes[1])
        expectTranslatedContent(wrapper3, INLINE_CONTENT_CLASS)

        await removeOrShowPageTranslation('bilingual', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
      it('translation only mode: should replace inline groups separated by br with wrappers', async () => {
        render(
          <div data-testid="test-node">
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            <br />
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
            {MOCK_ORIGINAL_TEXT}
            <br />
            <span style={{ display: 'inline' }}>{MOCK_ORIGINAL_TEXT}</span>
          </div>,
        )
        const node = screen.getByTestId('test-node')
        await removeOrShowPageTranslation('translationOnly', true)

        expectNodeLabels(node, [BLOCK_ATTRIBUTE])
        expectNodeLabels(node.children[0], [INLINE_ATTRIBUTE, PARAGRAPH_ATTRIBUTE])
        const wrapper1 = expectTranslationWrapper(node.children[0], 'translationOnly')
        expect(wrapper1).toBe(node.childNodes[0].childNodes[0])
        const wrapper2 = node.childNodes[2]
        expect(wrapper2).toHaveClass(CONTENT_WRAPPER_CLASS)
        const wrapper3 = expectTranslationWrapper(node.children[4], 'translationOnly')
        expect(wrapper3).toBe(node.childNodes[4].childNodes[0])

        await removeOrShowPageTranslation('translationOnly', true)
        expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
        expect(node.textContent).toBe(`${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}${MOCK_ORIGINAL_TEXT}`)
      })
    })
  })

  describe('switching between translation modes', () => {
    it('should properly clean up translations when switching from bilingual to translation-only mode', async () => {
      render(
        <div data-testid="test-node">
          {MOCK_ORIGINAL_TEXT}
        </div>,
      )
      const node = screen.getByTestId('test-node')
      await removeOrShowPageTranslation('bilingual', true)
      await removeOrShowPageTranslation('translationOnly', true)

      expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
      expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
    })
    it('should properly clean up translations when switching from translation-only to bilingual mode', async () => {
      render(
        <div data-testid="test-node">
          {MOCK_ORIGINAL_TEXT}
        </div>,
      )
      const node = screen.getByTestId('test-node')
      await removeOrShowPageTranslation('translationOnly', true)
      await removeOrShowPageTranslation('bilingual', true)

      expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
      expect(node.textContent).toBe(MOCK_ORIGINAL_TEXT)
    })
  })
})
