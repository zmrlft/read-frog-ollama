import { render, screen } from '@testing-library/react'

// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_CONFIG } from '@/utils/constants/config'

import {
  CONTENT_WRAPPER_CLASS,
  NOTRANSLATE_CLASS,
  TRANSLATION_MODE_ATTRIBUTE,
} from '@/utils/constants/dom-labels'
import { translateNodeTranslationOnlyMode } from '../translate/node-manipulation'
import { translateText } from '../translate/translate-text'

vi.mock('../translate/translate-text', () => ({
  translateText: vi.fn(() => Promise.resolve('translated content')),
  validateTranslationConfig: vi.fn(() => true),
}))

vi.mock('@/utils/config/config', () => ({
  globalConfig: DEFAULT_CONFIG,
}))

describe('translateText stub', () => {
  it('translateText should be mocked', async () => {
    expect(await translateText('任何文字')).toBe('translated content')
  })
})

describe('translateNodeTranslationOnlyMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('should replace original content with translation', async () => {
    render(<div data-testid="test-node">Original content</div>)
    const node = screen.getByTestId('test-node') as HTMLElement

    await translateNodeTranslationOnlyMode(node, false)

    // Should have a wrapper with display: contents
    const wrapper = node.querySelector(`.${CONTENT_WRAPPER_CLASS}`) as HTMLElement
    expect(wrapper).toBeTruthy()
    expect(wrapper.style.display).toBe('contents')

    // Should have translation mode attribute
    expect(wrapper.getAttribute(TRANSLATION_MODE_ATTRIBUTE)).toBe('translationOnly')

    // Original content should be completely replaced
    expect(node.innerHTML).not.toContain('Original content')
    expect(wrapper.textContent).toBe('translated content')
  })

  it('should handle HTML content correctly', async () => {
    render(
      <div data-testid="test-node">
        <span>Text 1</span>
        <strong>Text 2</strong>
        Some text
      </div>,
    )
    const node = screen.getByTestId('test-node') as HTMLElement

    await translateNodeTranslationOnlyMode(node, false)

    const wrapper = node.querySelector(`.${CONTENT_WRAPPER_CLASS}`) as HTMLElement
    expect(wrapper).toBeTruthy()
    expect(wrapper.textContent).toBe('translated content')
    expect(node.innerHTML).not.toContain('<span>Text 1</span>')
    expect(node.innerHTML).not.toContain('<strong>Text 2</strong>')
  })

  it('should restore original content when toggled off', async () => {
    render(
      <div data-testid="test-node">
        <span>Original</span>
        {' '}
        content with
        <strong>HTML</strong>
      </div>,
    )
    const node = screen.getByTestId('test-node') as HTMLElement

    const originalContent = node.innerHTML

    // Translate
    await translateNodeTranslationOnlyMode(node, false)
    expect(node.innerHTML).not.toContain('Original')

    // Toggle off to restore
    await translateNodeTranslationOnlyMode(node, true)
    expect(node.innerHTML).toBe(originalContent)
    expect(node.innerHTML).toContain('<span>Original</span>')
    expect(node.innerHTML).toContain('<strong>HTML</strong>')
  })

  it('should handle toggle on empty content', async () => {
    render(<div data-testid="test-node"></div>)
    const node = screen.getByTestId('test-node') as HTMLElement

    // Should not crash with empty content
    await translateNodeTranslationOnlyMode(node, false)
    expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
  })

  it('should handle toggle on whitespace-only content', async () => {
    render(<div data-testid="test-node">   </div>)
    const node = screen.getByTestId('test-node') as HTMLElement

    // Should not crash with whitespace-only content
    await translateNodeTranslationOnlyMode(node, false)
    expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
  })

  it('should remove existing translation when called again', async () => {
    render(<div data-testid="test-node">Original content</div>)
    const node = screen.getByTestId('test-node') as HTMLElement

    // First translation
    await translateNodeTranslationOnlyMode(node, false)
    const wrapper = node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)
    expect(wrapper).toBeTruthy()

    // Second translation (should replace the first)
    await translateNodeTranslationOnlyMode(node, false)
    const wrappers = node.querySelectorAll(`.${CONTENT_WRAPPER_CLASS}`)
    expect(wrappers).toHaveLength(1)
    expect(wrappers[0].textContent).toBe('translated content')
  })

  it('should preserve original content structure when restoring', async () => {
    render(
      <div data-testid="test-node">
        <div className="nested">
          <span id="special">Special text</span>
        </div>
        Text node
      </div>,
    )
    const node = screen.getByTestId('test-node') as HTMLElement

    const originalContent = node.innerHTML

    // Translate and then restore
    await translateNodeTranslationOnlyMode(node, false)
    await translateNodeTranslationOnlyMode(node, true)

    expect(node.innerHTML).toBe(originalContent)
    expect(node.querySelector('.nested')).toBeTruthy()
    expect(node.querySelector('#special')).toBeTruthy()
    expect(node.textContent).toContain('Special text')
    expect(node.textContent).toContain('Text node')
  })

  it('should clean HTML attributes from content before translation', async () => {
    const testElement = document.createElement('div')
    testElement.setAttribute('data-testid', 'test-node')
    testElement.setAttribute('data-read-frog-walked', 'test-id')
    testElement.setAttribute('data-read-frog-paragraph', '')
    testElement.innerHTML = '<span data-read-frog-block-node="">Content</span> with <!-- comment --> attributes'
    document.body.appendChild(testElement)

    const node = testElement as HTMLElement

    await translateNodeTranslationOnlyMode(node, false)

    // Should have called translateText with cleaned content
    expect(translateText).toHaveBeenCalledWith(
      expect.not.stringMatching(/data-read-frog/),
    )
    expect(translateText).toHaveBeenCalledWith(
      expect.not.stringMatching(/<!--.*-->/),
    )
  })

  it('should handle multiple consecutive calls correctly', async () => {
    render(<div data-testid="test-node">Original content</div>)
    const node = screen.getByTestId('test-node') as HTMLElement

    const originalContent = node.innerHTML

    // Multiple toggle operations
    await translateNodeTranslationOnlyMode(node, false) // translate
    await translateNodeTranslationOnlyMode(node, true) // restore
    await translateNodeTranslationOnlyMode(node, false) // translate again
    await translateNodeTranslationOnlyMode(node, true) // restore again

    expect(node.innerHTML).toBe(originalContent)
    expect(node.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
  })
})

describe('translation wrapper properties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('should set correct classes and attributes on wrapper', async () => {
    render(<div data-testid="test-node">Test content</div>)
    const node = screen.getByTestId('test-node') as HTMLElement

    await translateNodeTranslationOnlyMode(node, false)

    const wrapper = node.querySelector(`.${CONTENT_WRAPPER_CLASS}`) as HTMLElement
    expect(wrapper.classList.contains(NOTRANSLATE_CLASS)).toBe(true)
    expect(wrapper.classList.contains(CONTENT_WRAPPER_CLASS)).toBe(true)
    expect(wrapper.getAttribute(TRANSLATION_MODE_ATTRIBUTE)).toBe('translationOnly')
    expect(wrapper.style.display).toBe('contents')
  })

  it('should create wrapper as direct child of target node', async () => {
    render(<div data-testid="test-node">Test content</div>)
    const node = screen.getByTestId('test-node') as HTMLElement

    await translateNodeTranslationOnlyMode(node, false)

    const wrapper = node.querySelector(`.${CONTENT_WRAPPER_CLASS}`) as HTMLElement
    expect(wrapper.parentElement).toBe(node)
    expect(node.children).toHaveLength(1)
    expect(node.children[0]).toBe(wrapper)
  })
})
