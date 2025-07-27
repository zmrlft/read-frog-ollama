import type { TextUIPart } from 'ai'
import { readUIMessageStream, streamText } from 'ai'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Languages, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/tranlation/spinner'
import { ISO6393_TO_6391, LANG_CODE_TO_EN_NAME } from '@/types/config/languages'
import { isPureTranslateProvider } from '@/types/config/provider'
import { globalConfig } from '@/utils/config/config'
import { googleTranslate, microsoftTranslate } from '@/utils/host/translate/api'
import { getTranslatePrompt } from '@/utils/prompts/translate'
import { getTranslateModel } from '@/utils/provider'
import { isTooltipVisibleAtom, isTranslatePopoverVisibleAtom, mouseClickPositionAtom, selectionContentAtom } from './atom'

export function TranslateButton() {
  // const selectionContent = useAtomValue(selectionContentAtom)
  const setIsTooltipVisible = useSetAtom(isTooltipVisibleAtom)
  const setIsTranslatePopoverVisible = useSetAtom(isTranslatePopoverVisibleAtom)
  const setMousePosition = useSetAtom(mouseClickPositionAtom)

  const handleClick = async (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left
    const y = rect.top

    // const model = await getTranslateModel('openai', 'gpt-4o-mini')
    // const result = streamText({
    //   model,
    //   prompt: 'Write a short story about a robot.',
    // })

    // for await (const uiMessage of readUIMessageStream({
    //   stream: result.toUIMessageStream(),
    // })) {
    //   console.log('Current message state:', uiMessage)
    // }

    setMousePosition({ x, y })
    setIsTooltipVisible(false)
    setIsTranslatePopoverVisible(true)
  }

  return (
    <button type="button" className="size-6 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer" onClick={handleClick}>
      <Languages className="size-4" />
    </button>
  )
}

export function TranslatePopover() {
  const [isVisible, setIsVisible] = useAtom(isTranslatePopoverVisibleAtom)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | undefined>(undefined)
  const mouseClickPosition = useAtomValue(mouseClickPositionAtom)
  const selectionContent = useAtomValue(selectionContentAtom)
  const popoverRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTranslatedText(undefined)
  }, [setIsVisible])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current) {
        const eventPath = event.composedPath()
        const isClickInsideTooltip = eventPath.includes(popoverRef.current)
        if (!isClickInsideTooltip) {
          handleClose()
        }
      }
    }

    const translate = async () => {
      if (!selectionContent) {
        return
      }

      if (!globalConfig) {
        throw new Error('No global config when translate text')
      }
      const provider = globalConfig.translate.provider
      const modelConfig = globalConfig.translate.models[provider]
      if (!modelConfig && !isPureTranslateProvider(provider)) {
        throw new Error(`No configuration found for provider: ${provider}`)
      }
      const modelString = modelConfig?.isCustomModel ? modelConfig.customModel : modelConfig?.model

      setIsTranslating(true)
      if (isPureTranslateProvider(provider)) {
        const sourceLang = globalConfig.language.sourceCode === 'auto' ? 'auto' : (ISO6393_TO_6391[globalConfig.language.sourceCode] ?? 'auto')
        const targetLang = ISO6393_TO_6391[globalConfig.language.targetCode]
        if (!targetLang) {
          throw new Error('Invalid target language code')
        }
        if (provider === 'google') {
          setTranslatedText(await googleTranslate(selectionContent, sourceLang, targetLang))
        }
        else if (provider === 'microsoft') {
          setTranslatedText(await microsoftTranslate(selectionContent, sourceLang, targetLang))
        }
      }
      else if (modelString) {
        const targetLang = LANG_CODE_TO_EN_NAME[globalConfig.language.targetCode]
        if (!targetLang) {
          throw new Error('Invalid target language code')
        }
        const prompt = getTranslatePrompt(targetLang, selectionContent)
        const model = await getTranslateModel(provider, modelString)
        const result = streamText({
          model,
          prompt,
        })
        for await (const uiMessage of readUIMessageStream({
          stream: result.toUIMessageStream(),
        })) {
          setTranslatedText((uiMessage.parts[uiMessage.parts.length - 1] as TextUIPart).text)
        }
      }

      setIsTranslating(false)
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      translate()
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, selectionContent, handleClose])

  if (!isVisible || !mouseClickPosition) {
    return null
  }

  return (
    <div
      ref={popoverRef}
      className="fixed z-[2147483647] bg-white dark:bg-zinc-800 border rounded-lg shadow-xl p-4 w-[300px]"
      style={{
        left: mouseClickPosition.x,
        top: mouseClickPosition.y,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Translation</h3>
        <button
          type="button"
          onClick={handleClose}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
        >
          <X className="size-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Original
          </label>
          <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded border text-sm text-zinc-800 dark:text-zinc-200">
            {selectionContent || 'No text selected'}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Translation
          </label>
          <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded border text-sm text-zinc-800 dark:text-zinc-200 min-h-[60px]">
            {translatedText || 'Translation result will be displayed here...'}
            {' '}
            {isTranslating && <Spinner />}
          </div>
        </div>
      </div>
    </div>
  )
}
