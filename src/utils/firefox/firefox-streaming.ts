import { browser } from '#imports'

/**
 * Common streaming response types for Firefox runtime port communication
 */
export type StreamResponse<T = string>
  = | { type: 'chunk', data: T }
    | { type: 'done', data: T }
    | { type: 'error', error: string }

/**
 * Handles cleanup, abort signals, and disconnection automatically
 */
export function createPortStreamPromise<TResponse = string>(
  portName: string,
  payload: unknown,
  options: {
    signal?: AbortSignal
    onChunk?: (data: TResponse) => void
  } = {},
): Promise<TResponse> {
  return new Promise<TResponse>((resolve, reject) => {
    const { signal, onChunk } = options
    const port = browser.runtime.connect({ name: portName })

    let settled = false
    let finalData: TResponse | undefined
    let messageListener: ((event: StreamResponse<TResponse>) => void) | undefined
    let disconnectListener: (() => void) | undefined
    let abortListener: (() => void) | undefined

    const cleanup = () => {
      if (messageListener) {
        port.onMessage.removeListener(messageListener)
      }
      if (disconnectListener) {
        port.onDisconnect.removeListener(disconnectListener)
      }
      if (abortListener && signal) {
        signal.removeEventListener('abort', abortListener)
      }
    }

    const finalize = (callback: () => void) => {
      if (settled) {
        return
      }
      settled = true

      try {
        port.disconnect()
      }
      catch {
        // Firefox may throw if port already closed
      }

      callback()
      cleanup()
    }

    messageListener = (event: StreamResponse<TResponse>) => {
      if (event.type === 'chunk') {
        finalData = event.data
        onChunk?.(event.data)
        return
      }

      if (event.type === 'done') {
        finalData = event.data ?? finalData
        finalize(() => resolve(finalData as TResponse))
        return
      }

      if (event.type === 'error') {
        const errorMessage = event.error || 'Stream operation failed'
        finalize(() => reject(new Error(errorMessage)))
      }
    }

    disconnectListener = () => {
      finalize(() => reject(new Error('Stream disconnected unexpectedly')))
    }

    abortListener = () => {
      finalize(() => reject(new DOMException('aborted', 'AbortError')))
    }

    if (signal?.aborted) {
      abortListener()
      return
    }

    port.onMessage.addListener(messageListener)
    port.onDisconnect.addListener(disconnectListener)

    if (signal) {
      signal.addEventListener('abort', abortListener)
    }

    port.postMessage({
      type: 'start',
      payload,
    })
  })
}
