import type { PlatformConfig } from '@/entrypoints/subtitles.content/platforms'
import { YOUTUBE_NATIVE_SUBTITLES_CLASS, YOUTUBE_NAVIGATE_EVENT } from '@/utils/constants/subtitles'

export const youtubeConfig: PlatformConfig = {
  selectors: {
    video: 'video.html5-main-video',
    playerContainer: '.html5-video-player',
    controlsBar: '.ytp-right-controls',
    nativeSubtitles: YOUTUBE_NATIVE_SUBTITLES_CLASS,
  },

  navigation: {
    event: YOUTUBE_NAVIGATE_EVENT,
    getVideoId: () => {
      const params = new URLSearchParams(window.location.search)
      return params.get('v')
    },
  },
}
