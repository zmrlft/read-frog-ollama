import { Icon } from '@iconify/react'
import { useAtom, useSetAtom } from 'jotai'
import { isAiPopoverVisibleAtom, isTooltipVisibleAtom, mouseClickPositionAtom } from './atom'
import { PopoverWrapper } from './popover-wrapper'

export function AiButton() {
  const setIsTooltipVisible = useSetAtom(isTooltipVisibleAtom)
  const setIsAiPopoverVisible = useSetAtom(isAiPopoverVisibleAtom)
  const setMousePosition = useSetAtom(mouseClickPositionAtom)

  const handleClick = async (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left
    const y = rect.top

    setMousePosition({ x, y })
    setIsTooltipVisible(false)
    setIsAiPopoverVisible(true)
  }

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <button type="button" className="size-6 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer" onClick={handleClick}>
      <Icon icon="hugeicons:ai-innovation-02" strokeWidth={0.8} className="size-4" />
    </button>
  )
}

export function AiPopover() {
  const [isVisible, setIsVisible] = useAtom(isAiPopoverVisibleAtom)
  return (
    <PopoverWrapper
      title="AI"
      icon="hugeicons:ai-innovation-02"
      isVisible={isVisible}
      setIsVisible={setIsVisible}
    >
      <h1>AiPopover</h1>
    </PopoverWrapper>
  )
}
