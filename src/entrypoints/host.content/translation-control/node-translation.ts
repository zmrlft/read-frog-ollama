import type { Point } from '@/types/dom'
import { getLocalConfig } from '@/utils/config/storage'
import { DEFAULT_CONFIG } from '@/utils/constants/config'
import { isEditable } from '@/utils/host/dom/filter'
import { removeOrShowNodeTranslation } from '@/utils/host/translate/node-manipulation'
import { logger } from '@/utils/logger'

export function registerNodeTranslationTriggers() {
  const LONG_PRESS_TRIGGER_MS = 1000
  const LONG_PRESS_MOVE_TOLERANCE = 6

  const mousePosition: Point = { x: 0, y: 0 }
  let isHotkeyPressed = false
  let isHotkeySessionPure = true // tracks if any other key was pressed during this hotkey session

  const getHotkey = async () => {
    const config = await getLocalConfig() ?? DEFAULT_CONFIG
    return config.translate.node.hotkey
  }
  const isEnabled = async () => {
    const config = await getLocalConfig() ?? DEFAULT_CONFIG
    return config.translate.node.enabled
  }

  let timerId: NodeJS.Timeout | null = null
  let actionTriggered = false
  let longPressTimerId: NodeJS.Timeout | null = null
  let isMousePressed = false
  let longPressTriggered = false
  let mousePressPosition: Point | null = null

  const clearLongPressTimer = () => {
    if (longPressTimerId) {
      clearTimeout(longPressTimerId)
      longPressTimerId = null
    }
  }

  // Listen the hotkey means the user can't press or hold any other key during the hotkey is holding
  document.addEventListener('keydown', async (e) => {
    if (!await isEnabled())
      return
    if (e.target instanceof HTMLElement && isEditable(e.target))
      return

    const hotkey = await getHotkey()
    if (hotkey === 'LongPress')
      return
    if (e.key === hotkey) {
      if (!isHotkeyPressed) {
        isHotkeyPressed = true
        // isHotkeySessionPure will be false if any key was pressed before hotkey
        timerId = setTimeout(async () => {
          if (isHotkeySessionPure && isHotkeyPressed) {
            const config = await getLocalConfig()
            if (!config) {
              logger.error('Global config is not initialized')
              return
            }
            void removeOrShowNodeTranslation(mousePosition, config)
            actionTriggered = true
          }
          timerId = null
        }, 1000)
        // Cancel timer immediately if session is already impure
        if (!isHotkeySessionPure && timerId) {
          clearTimeout(timerId)
          timerId = null
        }
      }
    }
    else {
      // Any other key press marks the session as impure
      isHotkeySessionPure = false
      if (isHotkeyPressed && timerId) {
        clearTimeout(timerId)
        timerId = null
      }
    }
  })

  document.addEventListener('keyup', async (e) => {
    if (!await isEnabled())
      return
    if (e.target instanceof HTMLElement && isEditable(e.target))
      return
    const hotkey = await getHotkey()
    if (hotkey === 'LongPress')
      return
    if (e.key === hotkey) {
      // translate if user releases the hotkey and session is pure
      if (isHotkeySessionPure) {
        if (timerId) {
          clearTimeout(timerId)
          timerId = null
        }
        if (!actionTriggered) {
          const config = await getLocalConfig()
          if (!config) {
            logger.error('Global config is not initialized')
            return
          }
          void removeOrShowNodeTranslation(mousePosition, config)
        }
      }
      actionTriggered = false
      isHotkeyPressed = false
      isHotkeySessionPure = true
    }
  })

  document.addEventListener('mousedown', async (event) => {
    if (!await isEnabled())
      return
    if (event.button !== 0)
      return
    if (event.target instanceof HTMLElement && isEditable(event.target))
      return

    const hotkey = await getHotkey()
    if (hotkey !== 'LongPress')
      return

    isMousePressed = true
    longPressTriggered = false
    mousePressPosition = { x: event.clientX, y: event.clientY }
    mousePosition.x = event.clientX
    mousePosition.y = event.clientY

    clearLongPressTimer()
    longPressTimerId = setTimeout(async () => {
      if (!isMousePressed || !mousePressPosition || longPressTriggered)
        return
      const config = await getLocalConfig()
      if (!config) {
        logger.error('Global config is not initialized')
        return
      }
      void removeOrShowNodeTranslation(mousePressPosition, config)
      longPressTriggered = true
    }, LONG_PRESS_TRIGGER_MS)
  })

  document.addEventListener('mouseup', (event) => {
    if (event.button !== 0)
      return
    if (!isMousePressed && !longPressTimerId)
      return

    isMousePressed = false
    longPressTriggered = false
    mousePressPosition = null
    clearLongPressTimer()
  })

  document.addEventListener('mousemove', (event) => {
    mousePosition.x = event.clientX
    mousePosition.y = event.clientY

    if (!isMousePressed || !mousePressPosition)
      return

    const deltaX = event.clientX - mousePressPosition.x
    const deltaY = event.clientY - mousePressPosition.y
    if (Math.hypot(deltaX, deltaY) > LONG_PRESS_MOVE_TOLERANCE) {
      isMousePressed = false
      mousePressPosition = null
      clearLongPressTimer()
    }
  })
}
