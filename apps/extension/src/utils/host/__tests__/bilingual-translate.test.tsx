// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_CONFIG } from '@/utils/constants/config'
import {
  BLOCK_CONTENT_CLASS,
  CONTENT_WRAPPER_CLASS,
  INLINE_CONTENT_CLASS,
  NOTRANSLATE_CLASS,
} from '@/utils/constants/dom-labels'
import { walkAndLabelElement } from '../dom/traversal'
import { hideOrShowNodeTranslation, translateNodesBilingualMode, translateWalkedElement } from '../translate/node-manipulation'
import { translateText } from '../translate/translate-text'

vi.mock('../translate/translate-text', () => ({
  translateText: vi.fn(() => Promise.resolve('translation')),
  validateTranslationConfig: vi.fn(() => true),
}))

vi.mock('@/utils/config/config', () => ({
  globalConfig: DEFAULT_CONFIG,
}))

// Mock getComputedStyle globally to return proper default values
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

async function hideOrShowPageTranslation(toggle: boolean = false) {
  const id = crypto.randomUUID()

  walkAndLabelElement(document.body, id)
  await act(async () => {
    await translateWalkedElement(document.body, id, toggle)
  })
}

describe('translateText stub', () => {
  it('translateText should be mocked', async () => {
    expect(await translateText('任何文字')).toBe('translation')
  })
})

describe('translateNode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.textContent = ''
  })

  it('should insert wrapper into block node', async () => {
    render(
      <div
        data-testid="test-node"
        data-read-frog-block-node
        data-read-frog-paragraph
      >
        原文
      </div>,
    )
    const node = screen.getByTestId('test-node')
    await act(async () => {
      await translateNodesBilingualMode([node], false)
    })
    expect(node.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(node.childNodes[1].childNodes[1]).toHaveClass(BLOCK_CONTENT_CLASS)
  })

  it('should insert wrapper after text node', async () => {
    render(
      <div data-testid="test-node">
        原文
        <div>123</div>
      </div>,
    )
    const node = screen.getByTestId('test-node')
    const textNode = node.firstChild as Text
    await act(async () => {
      await translateNodesBilingualMode([textNode], false)
    })
    expect(node.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(node.childNodes[1].childNodes[1]).toHaveClass(INLINE_CONTENT_CLASS)
  })
})

describe('toggle translateWalkedElement', () => {
  it('should show then hide the block node translation', async () => {
    render(
      <div
        data-testid="test-node"
      >
        原文
      </div>,
    )
    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation(true)

    expect(node.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(node.childNodes[1].childNodes[1]).toHaveClass(BLOCK_CONTENT_CLASS)

    await hideOrShowPageTranslation(true)
    expect(node.childNodes.length).toBe(1)
  })
  it('should show then hide the inline html node translation', async () => {
    render(
      <div
        data-testid="test-node"
        style={{ display: 'inline' }}
      >
        123
      </div>,
    )
    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation(true)
    expect(node.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(node.childNodes[1].childNodes[1]).toHaveClass(INLINE_CONTENT_CLASS)

    await hideOrShowPageTranslation(true)
    expect(node.childNodes.length).toBe(1)
  })
  it('should show then hide the inline text node translation', async () => {
    render(
      <div
        data-testid="test-node"
      >
        1
        <div style={{ display: 'block' }}>2</div>
      </div>,
    )
    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation(true)
    expect(node.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(node.childNodes[1].childNodes[1]).toHaveClass(INLINE_CONTENT_CLASS)

    await hideOrShowPageTranslation(true)
    expect(node.childNodes.length).toBe(2)
  })
  it('should show then hide the consecutive inline text node translation', async () => {
    render(
      <div
        data-testid="test-node"
      >
        1
        <span style={{ display: 'inline' }}>2</span>
        <div style={{ display: 'block' }}>3</div>
      </div>,
    )

    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation(true)

    expect(node.childNodes[2]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(node.childNodes[2].childNodes[1]).toHaveClass(INLINE_CONTENT_CLASS)

    await hideOrShowPageTranslation(true)
    expect(node.childNodes.length).toBe(3)
  })
})

describe('translatePage', () => {
  it('should translate simple div node', async () => {
    render(<div data-testid="test-node">原文</div>)
    screen.getByTestId('test-node')

    await hideOrShowPageTranslation()
    const node = screen.getByTestId('test-node')
    expect(node.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(node.childNodes[1].childNodes[1]).toHaveClass(BLOCK_CONTENT_CLASS)
  })

  it('should handle inline elements separated by br tags correctly', async () => {
    render(
      <div data-testid="test-node">
        <span style={{ display: 'inline' }}>First inline text</span>
        <span style={{ display: 'inline' }}>Second inline text</span>
        <br />
        <span style={{ display: 'inline' }}>Third inline text</span>
        <span style={{ display: 'inline' }}>Fourth inline text</span>
        <br />
        <span style={{ display: 'inline' }}>Fifth inline text</span>
      </div>,
    )

    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation()

    // Should have multiple translation wrappers due to br tags breaking inline sequences
    const wrappers = node.querySelectorAll(`.${CONTENT_WRAPPER_CLASS}`)
    expect(wrappers.length).toBeGreaterThan(1)

    // Each wrapper should contain inline content
    wrappers.forEach((wrapper) => {
      expect(wrapper.childNodes[1]).toHaveClass(INLINE_CONTENT_CLASS)
    })
  })

  it('should not treat outer div as paragraph when it contains empty inline nodes and block nodes', async () => {
    render(
      <div data-testid="test-node">
        <span style={{ display: 'inline' }}></span>
        <span style={{ display: 'inline' }}>   </span>
        <div data-testid="inner-block">Block content</div>
        <div data-testid="another-block">Another block</div>
      </div>,
    )

    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation()

    // The outer div should not have translation wrapper directly attached to it
    const hasTranslationWrapper = Array.from(node.childNodes).some(child =>
      child instanceof HTMLElement && child.classList.contains(CONTENT_WRAPPER_CLASS),
    )
    expect(hasTranslationWrapper).toBe(false)

    // Only the inner block divs should have translation
    const innerBlock = screen.getByTestId('inner-block')
    const anotherBlock = screen.getByTestId('another-block')

    expect(innerBlock.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(innerBlock.childNodes[1].childNodes[1]).toHaveClass(BLOCK_CONTENT_CLASS)

    expect(anotherBlock.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(anotherBlock.childNodes[1].childNodes[1]).toHaveClass(BLOCK_CONTENT_CLASS)
  })

  it('should translate floating element as inline node', async () => {
    render(
      <div data-testid="test-node">
        <span style={{ float: 'left' }}>Floating text</span>
        <span style={{ display: 'inline' }}>Normal text</span>
      </div>,
    )

    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation()

    // The floating span should be treated as inline, and translation wrapper should be at the end of parent
    expect(node.lastChild).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(node.lastChild?.childNodes[1]).toHaveClass(BLOCK_CONTENT_CLASS)
  })

  it('should insert inline translation and block translation correctly in a node with inline and block node inside', async () => {
    render(
      <div data-testid="test-node">
        <span style={{ display: 'inline' }}>1</span>
        <div style={{ display: 'block' }}>2</div>
        <span style={{ display: 'inline' }}>3</span>
        4
        <span style={{ display: 'block' }}>5</span>
        6
        <br />
        7
      </div>,
    )
    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation()

    const firstSpanChild = node.firstChild
    expect(firstSpanChild).toHaveAttribute('data-read-frog-paragraph')
    expect(firstSpanChild?.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(firstSpanChild?.childNodes[1].childNodes[1]).toHaveClass(
      INLINE_CONTENT_CLASS,
    )

    const thirdDivChild = node.childNodes[1]
    expect(thirdDivChild).toHaveAttribute('data-read-frog-paragraph')
    expect(thirdDivChild?.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(thirdDivChild?.childNodes[1].childNodes[1]).toHaveClass(
      BLOCK_CONTENT_CLASS,
    )

    const sixthInlineTranslationChild = node.childNodes[4]
    expect(sixthInlineTranslationChild).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(sixthInlineTranslationChild?.childNodes[1]).toHaveClass(
      INLINE_CONTENT_CLASS,
    )

    const lastInlineTranslationChild = node.lastChild
    expect(lastInlineTranslationChild).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(lastInlineTranslationChild?.childNodes[1]).toHaveClass(
      INLINE_CONTENT_CLASS,
    )
  })
  it('should translate the deepest inline node', async () => {
    render(
      <div data-testid="test-node">
        <span style={{ display: 'inline' }}>
          <span style={{ display: 'inline' }}>1</span>
        </span>
      </div>,
    )

    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation()

    const targetNode = node.firstChild?.firstChild
    expect(targetNode?.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(targetNode?.childNodes[1].childNodes[1]).toHaveClass(
      INLINE_CONTENT_CLASS,
    )
  })
  it('should translate the deepest block node', async () => {
    render(
      <div data-testid="test-node">
        <div>
          <div>1</div>
        </div>
      </div>,
    )
    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation()
    const targetNode = node.firstChild?.firstChild
    expect(targetNode?.childNodes[1]).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(targetNode?.childNodes[1].childNodes[1]).toHaveClass(
      BLOCK_CONTENT_CLASS,
    )
  })
  it('should translate the middle node', async () => {
    render(
      <div data-testid="test-node">
        <span style={{ display: 'inline' }}>
          <div className="test" style={{ display: 'inline' }}>
            1
          </div>
          2
        </span>
      </div>,
    )
    const node = screen.getByTestId('test-node')
    await hideOrShowPageTranslation()
    const targetNode = node.firstChild
    expect(targetNode?.lastChild).toHaveClass(CONTENT_WRAPPER_CLASS)
    expect(targetNode?.lastChild?.lastChild).toHaveClass(INLINE_CONTENT_CLASS)
  })
})

describe('hideOrShowNodeTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('should show translation when hotkey is pressed over original text', async () => {
    const originalElement = document.createElement('div')
    originalElement.textContent = 'Original text'
    originalElement.style.position = 'absolute'
    originalElement.style.left = '100px'
    originalElement.style.top = '100px'
    originalElement.style.width = '200px'
    originalElement.style.height = '50px'
    document.body.appendChild(originalElement)

    // Mock getBoundingClientRect
    originalElement.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 300,
      bottom: 150,
      width: 200,
      height: 50,
    } as DOMRect))

    // Mock elementFromPoint
    document.elementFromPoint = vi.fn(() => originalElement)

    await act(async () => {
      await hideOrShowNodeTranslation({ x: 150, y: 125 })
    })

    // Should find translation wrapper
    const wrapper = document.querySelector(`.${CONTENT_WRAPPER_CLASS}`)
    expect(wrapper).toBeTruthy()
  })

  it('should hide translation when hotkey is pressed over translated content', async () => {
    const originalElement = document.createElement('div')
    originalElement.textContent = 'Original text'
    document.body.appendChild(originalElement)

    // Create translated content structure
    const wrapper = document.createElement('span')
    wrapper.className = `${NOTRANSLATE_CLASS} ${CONTENT_WRAPPER_CLASS}`

    const translatedContent = document.createElement('span')
    translatedContent.className = `${NOTRANSLATE_CLASS} ${BLOCK_CONTENT_CLASS}`
    translatedContent.textContent = 'Translated text'
    translatedContent.style.position = 'absolute'
    translatedContent.style.left = '100px'
    translatedContent.style.top = '100px'
    translatedContent.style.width = '200px'
    translatedContent.style.height = '50px'

    wrapper.appendChild(translatedContent)
    originalElement.appendChild(wrapper)

    // Mock getBoundingClientRect for translated content
    translatedContent.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 300,
      bottom: 150,
      width: 200,
      height: 50,
    } as DOMRect))

    // Mock elementFromPoint to return translated content
    document.elementFromPoint = vi.fn(() => translatedContent)

    await act(async () => {
      await hideOrShowNodeTranslation({ x: 150, y: 125 })
    })

    // Wrapper should be removed
    expect(document.querySelector(`.${CONTENT_WRAPPER_CLASS}`)).toBeFalsy()
  })
})
