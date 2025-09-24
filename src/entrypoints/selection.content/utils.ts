/**
 * Get the context sentences for the selected text
 * TODO: this is a simple version, need to improve
 */
export function getContext(selectionRange: Range) {
  const container = selectionRange.commonAncestorContainer
  const root = container.nodeType === Node.TEXT_NODE
    ? container.parentElement
    : (container as Element | null)

  if (!root) {
    return { before: '', selection: '', after: '' }
  }

  const fullText = root.textContent ?? ''
  const selection = selectionRange.toString()
  const index = fullText.indexOf(selection)

  if (index === -1) {
    return { before: '', selection, after: '' }
  }

  // 定义句子边界
  const boundaries = /[.!?。！？]/g

  // 找到前一个边界
  let start = 0
  for (let i = index; i >= 0; i--) {
    if (boundaries.test(fullText[i])) {
      start = i + 1
      break
    }
  }

  // 找到后一个边界
  let end = fullText.length
  for (let i = index + selection.length; i < fullText.length; i++) {
    if (boundaries.test(fullText[i])) {
      end = i + 1
      break
    }
  }

  const sentence = fullText.slice(start, end).trim()
  const relIndex = sentence.indexOf(selection)

  const before = sentence.slice(0, relIndex)
  const after = sentence.slice(relIndex + selection.length)

  return { before, selection, after }
}

interface Context {
  before: string
  selection: string
  after: string
}

export interface HighlightData {
  context: Context
}

/**
 * Create highlight data
 */
export function createHighlightData(selectionRange: Range): HighlightData {
  return {
    context: getContext(selectionRange),
  }
}
