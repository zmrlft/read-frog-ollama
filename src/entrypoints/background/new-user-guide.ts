import { browser } from '#imports'
import { OFFICIAL_SITE_URL_PATTERNS } from '@/utils/constants/url'
import { onMessage, sendMessage } from '@/utils/message'

let lastIsPinned = false

export function newUserGuide() {
  guidePinExtension()
}

export async function guidePinExtension() {
  onMessage('getPinState', async () => {
    const { isOnToolbar } = await browser.action.getUserSettings()
    return isOnToolbar
  })

  checkPinnedAndNotify()

  if (browser.action.onUserSettingsChanged) {
    browser.action.onUserSettingsChanged.addListener(checkPinnedAndNotify)
  }
  else {
    setInterval(checkPinnedAndNotify, 1_000)
  }
}

async function checkPinnedAndNotify() {
  const { isOnToolbar } = await browser.action.getUserSettings()
  if (isOnToolbar === lastIsPinned)
    return
  lastIsPinned = isOnToolbar

  browser.tabs.query({ url: OFFICIAL_SITE_URL_PATTERNS }, (tabs) => {
    for (const tab of tabs) {
      sendMessage('pinStateChanged', { isPinned: isOnToolbar }, tab.id)
    }
  })
}
