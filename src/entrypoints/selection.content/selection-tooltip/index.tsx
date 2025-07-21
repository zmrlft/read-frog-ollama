import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { isTooltipVisibleAtom, selectionContentAtom } from './atom'
import { TranslateButton, TranslatePopover } from './translate-button'

const DOWNWARD_OFFSET_Y = 18
const UPWARD_OFFSET_Y = -10
const MARGIN = 25
const SELECTION_DIRECTION_THRESHOLD = 5

export function SelectionTooltip() {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const tooltipContainerRef = useRef<HTMLDivElement>(null)
  const tooltipPositionRef = useRef({ x: 0, y: 0 }) // use ref to avoid re-rendering
  const mouseDownDocPositionRef = useRef({ x: 0, y: 0 }) // track mousedown position
  const pendingPositionRef = useRef<{ x: number, y: number, isDownwardSelection: boolean } | null>(null) // store pending position calculation
  const previousSelectionTextRef = useRef<string | null>(null)
  const isDraggingFromTooltipRef = useRef(false) // track if dragging started from tooltip
  const [isTooltipVisible, setIsTooltipVisible] = useAtom(isTooltipVisibleAtom)
  const setSelectionContent = useSetAtom(selectionContentAtom)

  // Calculate position after tooltip is rendered
  useLayoutEffect(() => {
    if (isTooltipVisible && pendingPositionRef.current && tooltipRef.current) {
      const { x, y, isDownwardSelection } = pendingPositionRef.current
      const tooltipWidth = tooltipRef.current.offsetWidth
      const tooltipHeight = tooltipRef.current.offsetHeight

      // Recalculate x position with actual tooltip width
      const docX = x - tooltipWidth / 2

      // X-axis boundary checking with margin
      const clientWidth = document.documentElement.clientWidth
      const leftBoundary = 0
      const rightBoundary = clientWidth - tooltipWidth - MARGIN

      // Priority: ensure left boundary first, then try to satisfy right boundary
      const finalX = Math.max(leftBoundary, Math.min(rightBoundary, docX))
      let finalY = y
      if (isDownwardSelection) {
        finalY = y + DOWNWARD_OFFSET_Y
      }
      else {
        finalY = y - tooltipHeight + UPWARD_OFFSET_Y
      }

      tooltipPositionRef.current = { x: finalX, y: finalY }

      // Update position immediately
      tooltipRef.current.style.left = `${finalX}px`
      tooltipRef.current.style.top = `${finalY}px`

      pendingPositionRef.current = null
    }
  }, [isTooltipVisible])

  useEffect(() => {
    let animationFrameId: number

    const handleMouseUp = (e: MouseEvent) => {
      // If dragging started from tooltip, don't hide it
      if (isDraggingFromTooltipRef.current) {
        isDraggingFromTooltipRef.current = false // reset state
        return
      }

      // check if there is text selected
      const selection = window.getSelection()
      const selectedText = selection?.toString().trim() || ''

      if (selection && selectedText.length > 0 && selectedText !== previousSelectionTextRef.current) {
        previousSelectionTextRef.current = selectedText
        setSelectionContent(selectedText)
        // calculate the position relative to the document
        const scrollY = window.scrollY
        const scrollX = window.scrollX

        const docX = e.clientX + scrollX
        const docY = e.clientY + scrollY
        // allow a small threshold to avoid the selection direction is not downward
        const isDownwardSelection = docY + SELECTION_DIRECTION_THRESHOLD >= mouseDownDocPositionRef.current.y

        // Store pending position for useLayoutEffect to process
        pendingPositionRef.current = { x: docX, y: docY, isDownwardSelection }
        setIsTooltipVisible(true)
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      // Check if dragging started from within the tooltip container
      if (tooltipContainerRef.current) {
        const eventPath = e.composedPath()
        isDraggingFromTooltipRef.current = eventPath.includes(tooltipContainerRef.current)
      }
      else {
        isDraggingFromTooltipRef.current = false
      }

      if (isDraggingFromTooltipRef.current) {
        return
      }

      setIsTooltipVisible(false)
      mouseDownDocPositionRef.current = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY }
    }

    const handleSelectionChange = () => {
      // if the selected content is cleared, hide the tooltip
      const selection = window.getSelection()
      if (!selection || selection.toString().trim().length === 0) {
        setIsTooltipVisible(false)
      }
    }

    const updatePosition = () => {
      if (!isTooltipVisible || !tooltipRef.current)
        return

      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const tooltipHeight = tooltipRef.current.offsetHeight // calculate height from component

      // calculate strict boundaries
      const topBoundary = scrollY + MARGIN
      const bottomBoundary = scrollY + viewportHeight - tooltipHeight - MARGIN

      // calculate the position of the tooltip, but strictly limit it within the boundaries
      const clampedY = Math.max(topBoundary, Math.min(bottomBoundary, tooltipPositionRef.current.y))

      // also clamp X position to viewport boundaries
      const viewportWidth = document.documentElement.clientWidth
      const tooltipWidth = tooltipRef.current.offsetWidth
      const clampedX = Math.max(MARGIN, Math.min(viewportWidth - tooltipWidth - MARGIN, tooltipPositionRef.current.x))

      // directly operate the DOM, avoid React re-rendering
      tooltipRef.current.style.left = `${clampedX}px`
      tooltipRef.current.style.top = `${clampedY}px`
    }

    const handleScroll = () => {
      // cancel the previous animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      // use requestAnimationFrame to ensure rendering synchronization
      animationFrameId = requestAnimationFrame(updatePosition)
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('selectionchange', handleSelectionChange)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('selectionchange', handleSelectionChange)
      window.removeEventListener('scroll', handleScroll)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isTooltipVisible, setSelectionContent, setIsTooltipVisible])

  return (
    <div ref={tooltipContainerRef}>
      {isTooltipVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-[2147483647] bg-zinc-200 dark:bg-zinc-800 rounded-sm shadow-lg overflow-hidden flex items-center"
          style={{
            left: `${tooltipPositionRef.current.x}px`,
            top: `${tooltipPositionRef.current.y}px`,
          }}
        >
          <TranslateButton />
        </div>
      )}
      <TranslatePopover />
    </div>
  )
}
