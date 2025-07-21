import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Languages, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { isTooltipVisibleAtom, isTranslatePopoverVisibleAtom, mouseClickPositionAtom, selectionContentAtom } from './atom'

export function TranslateButton() {
  // const selectionContent = useAtomValue(selectionContentAtom)
  const setIsTooltipVisible = useSetAtom(isTooltipVisibleAtom)
  const setIsTranslatePopoverVisible = useSetAtom(isTranslatePopoverVisibleAtom)
  const setMousePosition = useSetAtom(mouseClickPositionAtom)

  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left
    const y = rect.top

    setMousePosition({ x, y })
    setIsTooltipVisible(false)
    setIsTranslatePopoverVisible(true)
  }

  return (
    <button type="button" className="size-6 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer" onClick={handleClick}>
      <Languages className="size-4" />
      <TranslatePopover />
    </button>
  )
}

export function TranslatePopover() {
  const [isVisible, setIsVisible] = useAtom(isTranslatePopoverVisibleAtom)
  const mouseClickPosition = useAtomValue(mouseClickPositionAtom)
  const selectionContent = useAtomValue(selectionContentAtom)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current) {
        const eventPath = event.composedPath()
        const isClickInsideTooltip = eventPath.includes(popoverRef.current)
        if (!isClickInsideTooltip) {
          setIsVisible(false)
        }
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, setIsVisible])

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
          onClick={() => setIsVisible(false)}
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
            Translation result will be displayed here...
          </div>
        </div>
      </div>
    </div>
  )
}
