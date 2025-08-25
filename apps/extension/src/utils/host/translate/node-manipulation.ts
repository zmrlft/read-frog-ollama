import type { APICallError } from 'ai'
import type { TranslationMode } from '@/types/config/translate'
import type { Point, TransNode } from '@/types/dom'
import React from 'react'
import textSmallCSS from '@/assets/tailwind/text-small.css?inline'
import themeCSS from '@/assets/tailwind/theme.css?inline'
import { TranslationError } from '@/components/translation/error'
import { Spinner } from '@/components/translation/spinner'
import { globalConfig } from '@/utils/config/config'
import { createReactShadowHost, removeReactShadowHost } from '@/utils/react-shadow-host/create-shadow-host'
import {
  BLOCK_ATTRIBUTE,
  BLOCK_CONTENT_CLASS,
  CONSECUTIVE_INLINE_END_ATTRIBUTE,
  CONTENT_WRAPPER_CLASS,
  INLINE_CONTENT_CLASS,
  MARK_ATTRIBUTES,
  NOTRANSLATE_CLASS,
  PARAGRAPH_ATTRIBUTE,
  REACT_SHADOW_HOST_CLASS,
  TRANSLATION_ERROR_CONTAINER_CLASS,
  TRANSLATION_MODE_ATTRIBUTE,
  WALKED_ATTRIBUTE,
} from '../../constants/dom-labels'
import { FORCE_INLINE_TRANSLATION_TAGS } from '../../constants/dom-tags'
import { isBlockTransNode, isHTMLElement, isInlineTransNode, isTextNode, isTranslatedContentNode, isTranslatedWrapperNode } from '../dom/filter'
import { deepQueryTopLevelSelector, findNearestAncestorBlockNodeAt, findTranslatedContentWrapper, unwrapDeepestOnlyHTMLChild } from '../dom/find'
import { getOwnerDocument } from '../dom/node'
import {
  extractTextContent,
  walkAndLabelElement,
} from '../dom/traversal'
import { decorateTranslationNode } from './decorate-translation'
import { translateText, validateTranslationConfig } from './translate-text'

const translatingNodes = new WeakSet<HTMLElement | Text>()
const originalContentMap = new WeakMap<HTMLElement, string>()

// Pre-compiled regex for better performance - removes all mark attributes
const MARK_ATTRIBUTES_REGEX = new RegExp(`\\s*(?:${Array.from(MARK_ATTRIBUTES).join('|')})(?:=['""][^'"]*['""]|=[^\\s>]*)?`, 'g')

export async function hideOrShowNodeTranslation(point: Point) {
  const node = findNearestAncestorBlockNodeAt(point)

  if (!node || !isHTMLElement(node))
    return

  // Check if the found node is translated content
  if (isTranslatedContentNode(node)) {
    const wrapper = findTranslatedContentWrapper(node)
    if (wrapper) {
      removeShadowHostInTranslatedWrapper(wrapper)
      wrapper.remove()
    }
    return
  }
  if (!validateTranslationConfig({
    providersConfig: globalConfig!.providersConfig,
    translate: globalConfig!.translate,
    language: globalConfig!.language,
  })) {
    return
  }

  const id = crypto.randomUUID()
  walkAndLabelElement(node, id)
  await translateWalkedElement(node, id, true)
}

export function removeAllTranslatedWrapperNodes(
  root: Document | ShadowRoot = document,
) {
  if (!globalConfig)
    return

  const translatedNodes = deepQueryTopLevelSelector(root, isTranslatedWrapperNode)
  translatedNodes.forEach((contentWrapperNode) => {
    removeTranslatedWrapperWithRestore(contentWrapperNode)
  })
}

/**
 * Translate the node
 * @param nodes - The nodes to translate
 * @param toggle - Whether to toggle the translation, if true, the translation will be removed if it already exists
 */
export async function translateNodesBilingualMode(nodes: TransNode[], toggle: boolean = false) {
  try {
    // prevent duplicate translation
    if (nodes.every(node => translatingNodes.has(node))) {
      return
    }
    nodes.forEach(node => translatingNodes.add(node))

    const lastNode = nodes[nodes.length - 1]
    const targetNode
      = nodes.length === 1 && isHTMLElement(lastNode) ? unwrapDeepestOnlyHTMLChild(lastNode) : lastNode

    const existedTranslatedWrapper = findExistedTranslatedWrapper(targetNode)
    if (existedTranslatedWrapper) {
      removeTranslatedWrapperWithRestore(existedTranslatedWrapper)
      if (toggle) {
        return
      }
    }

    const textContent = nodes.map(node => extractTextContent(node)).join(' ')
    if (!textContent)
      return

    const ownerDoc = getOwnerDocument(targetNode)
    const translatedWrapperNode = ownerDoc.createElement('span')
    translatedWrapperNode.className = `${NOTRANSLATE_CLASS} ${CONTENT_WRAPPER_CLASS}`
    translatedWrapperNode.setAttribute(TRANSLATION_MODE_ATTRIBUTE, 'bilingual' satisfies TranslationMode)
    const spinner = createSpinnerInside(translatedWrapperNode)

    if (isTextNode(targetNode) || nodes.length > 1) {
      targetNode.parentNode?.insertBefore(
        translatedWrapperNode,
        targetNode.nextSibling,
      )
    }
    else {
      targetNode.appendChild(translatedWrapperNode)
    }

    const translatedText = await getTranslatedTextAndRemoveSpinner(nodes, textContent, spinner, translatedWrapperNode)

    if (!translatedText)
      return

    insertTranslatedNodeIntoWrapper(
      translatedWrapperNode,
      targetNode,
      translatedText,
    )
  }
  finally {
    nodes.forEach(node => translatingNodes.delete(node))
  }
}

export async function translateNodeTranslationOnlyMode(node: HTMLElement, toggle: boolean = false) {
  try {
    if (translatingNodes.has(node)) {
      return
    }
    translatingNodes.add(node)

    const existedTranslatedWrapper = findExistedTranslatedWrapper(node)
    if (existedTranslatedWrapper) {
      removeTranslatedWrapperWithRestore(existedTranslatedWrapper)
      if (toggle) {
        return
      }
    }

    const cleanTextContent = (content: string): string => {
      if (!content)
        return content

      let cleanedContent = content.replace(MARK_ATTRIBUTES_REGEX, '')
      cleanedContent = cleanedContent.replace(/<!--[\s\S]*?-->/g, ' ')
      cleanedContent = cleanedContent.replace(/\s+/g, ' ').trim()

      return cleanedContent
    }

    originalContentMap.set(node, node.innerHTML)
    const textContent = cleanTextContent(node.innerHTML)
    if (!textContent)
      return

    const ownerDoc = getOwnerDocument(node)
    const translatedWrapperNode = ownerDoc.createElement('span')
    translatedWrapperNode.className = `${NOTRANSLATE_CLASS} ${CONTENT_WRAPPER_CLASS}`
    translatedWrapperNode.setAttribute(TRANSLATION_MODE_ATTRIBUTE, 'translationOnly' satisfies TranslationMode)
    translatedWrapperNode.style.display = 'contents'
    const spinner = createSpinnerInside(translatedWrapperNode)

    node.appendChild(translatedWrapperNode)

    const translatedText = await getTranslatedTextAndRemoveSpinner([node], textContent, spinner, translatedWrapperNode)

    if (!translatedText)
      return

    translatedWrapperNode.innerHTML = translatedText

    node.innerHTML = ''
    node.appendChild(translatedWrapperNode)
  }
  finally {
    translatingNodes.delete(node)
  }
}

function createSpinnerInside(translatedWrapperNode: HTMLElement) {
  const spinComponent = React.createElement(Spinner)
  const container = createReactShadowHost(
    spinComponent,
    {
      position: 'inline',
      inheritStyles: false,
      cssContent: [themeCSS, textSmallCSS],
      style: {
        verticalAlign: 'middle',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
  )
  translatedWrapperNode.appendChild(container)
  return container
}

function findExistedTranslatedWrapper(node: TransNode): HTMLElement | null {
  if (isTextNode(node) || node.hasAttribute(CONSECUTIVE_INLINE_END_ATTRIBUTE)) {
    if (
      node.nextSibling && isHTMLElement(node.nextSibling)
      && node.nextSibling.classList.contains(CONTENT_WRAPPER_CLASS)
    ) {
      return node.nextSibling
    }
  }
  else if (isHTMLElement(node)) {
    // Check if the node itself is a translated wrapper
    if (node.classList.contains(CONTENT_WRAPPER_CLASS)) {
      return node
    }
    // Otherwise, look for a wrapper as a direct child
    return node.querySelector(`:scope > .${CONTENT_WRAPPER_CLASS}`)
  }
  return null
}

function insertTranslatedNodeIntoWrapper(
  translatedWrapperNode: HTMLElement,
  targetNode: TransNode,
  translatedText: string,
) {
  // Use the wrapper's owner document
  const ownerDoc = getOwnerDocument(translatedWrapperNode)
  const translatedNode = ownerDoc.createElement('span')
  const isForceInlineTranslationElement
    = isHTMLElement(targetNode)
      && FORCE_INLINE_TRANSLATION_TAGS.has(targetNode.tagName)

  if (isForceInlineTranslationElement || isInlineTransNode(targetNode)) {
    const spaceNode = ownerDoc.createElement('span')
    spaceNode.textContent = '  '
    translatedWrapperNode.appendChild(spaceNode)
    translatedNode.className = `${NOTRANSLATE_CLASS} ${INLINE_CONTENT_CLASS}`
  }
  else if (isBlockTransNode(targetNode)) {
    const brNode = ownerDoc.createElement('br')
    translatedWrapperNode.appendChild(brNode)
    translatedNode.className = `${NOTRANSLATE_CLASS} ${BLOCK_CONTENT_CLASS}`
  }
  else {
    // not inline or block, maybe notranslate
    return
  }

  translatedNode.textContent = translatedText
  decorateTranslationNode(translatedNode)
  translatedWrapperNode.appendChild(translatedNode)
}

async function getTranslatedTextAndRemoveSpinner(nodes: TransNode[], textContent: string, spinner: HTMLElement, translatedWrapperNode: HTMLElement) {
  let translatedText: string | undefined

  try {
    translatedText = await translateText(textContent)
  }
  catch (error) {
    removeReactShadowHost(spinner)

    const errorComponent = React.createElement(TranslationError, {
      nodes,
      error: error as APICallError,
    })

    const container = createReactShadowHost(
      errorComponent,
      {
        className: TRANSLATION_ERROR_CONTAINER_CLASS,
        position: 'inline',
        inheritStyles: false,
        cssContent: [themeCSS, textSmallCSS],
        style: {
          verticalAlign: 'middle',
        },
      },
    )

    translatedWrapperNode.appendChild(container)
  }
  finally {
    removeReactShadowHost(spinner)
  }

  return translatedText
}

function removeShadowHostInTranslatedWrapper(wrapper: HTMLElement) {
  const translationShadowHost = wrapper.querySelector(`.${REACT_SHADOW_HOST_CLASS}`)
  if (translationShadowHost && isHTMLElement(translationShadowHost)) {
    removeReactShadowHost(translationShadowHost)
  }
}

/**
 * Remove translated wrapper and restore original content based on translation mode
 * @param wrapper - The translated wrapper element to remove
 */
function removeTranslatedWrapperWithRestore(wrapper: HTMLElement) {
  removeShadowHostInTranslatedWrapper(wrapper)

  const translationMode = wrapper.getAttribute(TRANSLATION_MODE_ATTRIBUTE)
  const wrapperParent = wrapper.parentNode

  if (translationMode === 'translationOnly' && wrapperParent && isHTMLElement(wrapperParent)) {
    // For translation-only mode, restore original content
    const originalContent = originalContentMap.get(wrapperParent)
    if (originalContent) {
      wrapperParent.innerHTML = originalContent
      originalContentMap.delete(wrapperParent)
      return
    }
  }

  // For bilingual mode or when no original content is found, just remove the wrapper
  wrapper.remove()
}

/**
 * Translate the element if it has inline node child
 * @param element - The element to translate
 * @param walkId - The walk id
 * @param toggle - Whether to toggle the translation, if true, the translation will be removed if it already exists
 */
export async function translateWalkedElement(
  element: HTMLElement,
  walkId: string,
  toggle: boolean = false,
) {
  if (!globalConfig) {
    return
  }

  const translationMode = globalConfig.translate.mode

  const promises: Promise<void>[] = []

  // if the walkId is not the same, return
  if (element.getAttribute(WALKED_ATTRIBUTE) !== walkId)
    return

  if (element.hasAttribute(PARAGRAPH_ATTRIBUTE)) {
    let hasBlockNodeChild = false

    for (const child of element.childNodes) {
      if (isHTMLElement(child) && child.hasAttribute(BLOCK_ATTRIBUTE)) {
        hasBlockNodeChild = true
        break
      }
    }

    if (translationMode === 'translationOnly') {
      promises.push(translateNodeTranslationOnlyMode(element, toggle))
    }
    else if (!hasBlockNodeChild) {
      promises.push(translateNodesBilingualMode([element], toggle))
    }
    else {
      // prevent children change during iteration
      const children = Array.from(element.childNodes)
      let consecutiveInlineNodes: TransNode[] = []
      for (const child of children) {
        if (!(isTextNode(child) || isHTMLElement(child))) {
          continue
        }

        if (isInlineTransNode(child)) {
          consecutiveInlineNodes.push(child)
          continue
        }
        else if (consecutiveInlineNodes.length) {
          promises.push(dealWithConsecutiveInlineNodes(consecutiveInlineNodes, toggle))
          consecutiveInlineNodes = []
        }

        if (isHTMLElement(child)) {
          promises.push(translateWalkedElement(child, walkId, toggle))
        }
      }

      if (consecutiveInlineNodes.length) {
        promises.push(dealWithConsecutiveInlineNodes(consecutiveInlineNodes, toggle))
        consecutiveInlineNodes = []
      }
    }
  }
  else {
    const promises: Promise<void>[] = []
    for (const child of element.childNodes) {
      if (isHTMLElement(child)) {
        promises.push(translateWalkedElement(child, walkId, toggle))
      }
    }
    if (element.shadowRoot) {
      for (const child of element.shadowRoot.children) {
        if (isHTMLElement(child)) {
          promises.push(translateWalkedElement(child, walkId, toggle))
        }
      }
    }
  }
  // This simultaneously ensures that when concurrent translation
  // and external await call this function, all translations are completed
  await Promise.all(promises)
}

async function dealWithConsecutiveInlineNodes(nodes: TransNode[], toggle: boolean = false) {
  if (nodes.length > 1) {
    // give attribute to the last node
    const lastNode = nodes[nodes.length - 1]
    if (isHTMLElement(lastNode)) {
      lastNode.setAttribute(CONSECUTIVE_INLINE_END_ATTRIBUTE, '')
    }
  }
  await translateNodesBilingualMode(nodes, toggle)
}
