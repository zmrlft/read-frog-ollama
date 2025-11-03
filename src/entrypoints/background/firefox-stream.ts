import type { TextUIPart } from 'ai'
import { readUIMessageStream, streamText } from 'ai'
import { logger } from '@/utils/logger'
import { getReadModelById, getTranslateModelById } from '@/utils/providers/model'

export interface AnalyzeSelectionParams {
  providerId: string
  systemPrompt: string
  userMessage: string
  temperature?: number
}

export interface TranslateStreamParams {
  providerId: string
  prompt: string
  providerOptions?: unknown
  temperature?: number
}

export interface StreamOptions {
  signal?: AbortSignal
  onChunk?: (chunk: string, fullResponse: string) => void
}

interface StreamPortResponse {
  type: 'chunk' | 'done' | 'error'
  data?: string
  error?: string
}

interface ExtensionPort {
  name: string
  postMessage: (message: StreamPortResponse) => void
  disconnect: () => void
  onMessage: {
    addListener: (listener: (message: unknown) => void) => void
    removeListener: (listener: (message: unknown) => void) => void
  }
  onDisconnect: {
    addListener: (listener: () => void) => void
    removeListener: (listener: () => void) => void
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unexpected error occurred'
}

function createStreamPortHandler<TMessage, TPayload>(
  streamFn: (payload: TPayload, options: StreamOptions) => Promise<string>,
  messageValidator: (msg: unknown) => msg is TMessage & { payload: TPayload },
) {
  return (port: ExtensionPort) => {
    const abortController = new AbortController()
    let isActive = true
    let hasStarted = false
    let messageListener: ((rawMessage: unknown) => void) | undefined
    let disconnectListener: (() => void) | undefined

    const safePost = (response: StreamPortResponse) => {
      if (!isActive || abortController.signal.aborted) {
        return
      }
      try {
        port.postMessage(response)
      }
      catch (error) {
        logger.error('[Background] Stream port post failed', error)
      }
    }

    const cleanup = () => {
      if (!isActive) {
        return
      }
      isActive = false
      if (messageListener) {
        port.onMessage.removeListener(messageListener)
      }
      if (disconnectListener) {
        port.onDisconnect.removeListener(disconnectListener)
      }
    }

    disconnectListener = () => {
      abortController.abort()
      cleanup()
    }

    messageListener = async (rawMessage: unknown) => {
      if (hasStarted) {
        return
      }

      if (!messageValidator(rawMessage)) {
        return
      }

      hasStarted = true

      try {
        const result = await streamFn(rawMessage.payload, {
          signal: abortController.signal,
          onChunk: (_, fullResponse) => {
            safePost({ type: 'chunk', data: fullResponse })
          },
        })

        if (!abortController.signal.aborted) {
          safePost({ type: 'done', data: result })
        }
      }
      catch (error) {
        if (!abortController.signal.aborted) {
          safePost({ type: 'error', error: getErrorMessage(error) })
        }
      }
      finally {
        cleanup()
        try {
          port.disconnect()
        }
        catch {
          // Ignore disconnect errors in Firefox
        }
      }
    }

    port.onMessage.addListener(messageListener)
    port.onDisconnect.addListener(disconnectListener)
  }
}

export async function runAnalyzeSelectionStream(
  params: AnalyzeSelectionParams,
  options: StreamOptions = {},
) {
  const { providerId, systemPrompt, userMessage, temperature = 0.2 } = params
  const { signal, onChunk } = options

  if (signal?.aborted) {
    throw new DOMException('stream aborted', 'AbortError')
  }

  const model = await getReadModelById(providerId)

  const result = await streamText({
    model,
    temperature,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    abortSignal: signal,
  })

  let fullResponse = ''

  for await (const delta of result.textStream) {
    if (signal?.aborted) {
      throw new DOMException('stream aborted', 'AbortError')
    }

    fullResponse += delta
    onChunk?.(delta, fullResponse)
  }

  return fullResponse
}

export async function runTranslateLLMStream(
  params: TranslateStreamParams,
  options: StreamOptions = {},
) {
  const { providerId, prompt, providerOptions, temperature } = params
  const { signal, onChunk } = options

  if (signal?.aborted) {
    throw new DOMException('stream aborted', 'AbortError')
  }

  const model = await getTranslateModelById(providerId)

  const streamConfig: Record<string, unknown> = {
    model,
    prompt,
    abortSignal: signal,
  }

  if (providerOptions !== undefined) {
    streamConfig.providerOptions = providerOptions
  }

  if (temperature !== undefined) {
    streamConfig.temperature = temperature
  }

  const result = await streamText(streamConfig as Parameters<typeof streamText>[0])

  let latestText = ''

  for await (const uiMessage of readUIMessageStream({ stream: result.toUIMessageStream() })) {
    if (signal?.aborted) {
      throw new DOMException('stream aborted', 'AbortError')
    }

    const lastPart = uiMessage.parts[uiMessage.parts.length - 1] as TextUIPart | undefined
    if (lastPart?.type === 'text') {
      latestText = lastPart.text
      onChunk?.(latestText, latestText)
    }
  }

  return latestText
}

export const handleAnalyzeSelectionPort = createStreamPortHandler<
  { type: 'start', payload: AnalyzeSelectionParams },
  AnalyzeSelectionParams
>(
  runAnalyzeSelectionStream,
  (msg): msg is { type: 'start', payload: AnalyzeSelectionParams } => {
    const message = msg as { type: 'start', payload: AnalyzeSelectionParams }
    return message?.type === 'start' && !!message.payload
  },
)

export const handleTranslateStreamPort = createStreamPortHandler<
  { type: 'start', payload: TranslateStreamParams },
  TranslateStreamParams
>(
  runTranslateLLMStream,
  (msg): msg is { type: 'start', payload: TranslateStreamParams } => {
    const message = msg as { type: 'start', payload: TranslateStreamParams }
    return message?.type === 'start' && !!message.payload
  },
)
