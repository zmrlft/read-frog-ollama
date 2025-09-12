import { Icon } from '@iconify/react'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { MARGIN } from '@/utils/constants/selection'
import { mouseClickPositionAtom, selectionContentAtom } from './atom'
import { useDraggable } from './use-draggable'

interface PopoverWrapperProps {
  title: string
  icon: string
  children: React.ReactNode
  onClose?: () => void
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}

export function PopoverWrapper({ title, icon, children, onClose, isVisible, setIsVisible }: PopoverWrapperProps) {
  const mouseClickPosition = useAtomValue(mouseClickPositionAtom)
  const selectionContent = useAtomValue(selectionContentAtom)

  const { dragRef, containerRef: popoverRef, style: popoverStyle, isDragging } = useDraggable({
    initialPosition: mouseClickPosition || { x: 0, y: 0 },
    margin: MARGIN,
    isVisible,
  })

  const handleClose = useCallback(() => {
    setIsVisible(false)
    onClose?.()
  }, [setIsVisible, onClose])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!popoverRef.current) {
        return
      }
      const eventPath = event.composedPath()
      const isClickInsideTooltip = eventPath.includes(popoverRef.current)
      if (!isClickInsideTooltip) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClose, popoverRef])

  if (!isVisible || !mouseClickPosition || !selectionContent) {
    return null
  }

  return (
    <div
      className="fixed z-[2147483647] bg-white dark:bg-zinc-800 border rounded-lg w-[300px] shadow-lg"
      ref={popoverRef as React.RefObject<HTMLDivElement>}
      style={popoverStyle}
    >
      <div
        ref={dragRef as React.RefObject<HTMLDivElement>}
        className="group relative flex items-center justify-between p-4 border-b hover:cursor-grab active:cursor-grabbing select-none"
      >
        {/* Drag icon positioned at top */}
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 p-1 transition-all duration-200 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{
            color: isDragging ? 'var(--read-frog-primary)' : undefined,
          }}
        >
          <Icon icon="tabler:grip-horizontal" className="size-4" />
        </div>

        <div className="flex items-center gap-2">
          <Icon icon={icon} strokeWidth={0.8} className="size-4.5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">{title}</h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
        >
          <Icon icon="tabler:x" strokeWidth={1} className="size-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>
      {children}
    </div>
  )
}
