import { useAtomValue } from 'jotai'
import { subtitlesDisplayAtom } from '../atoms'
import { StateMessage } from './state-message'
import { SubtitlesView } from './subtitles-view'

export function SubtitlesContainer() {
  const { subtitle, stateData, isVisible } = useAtomValue(subtitlesDisplayAtom)

  if (!isVisible) {
    return null
  }

  if (stateData && stateData.state !== 'idle') {
    return <StateMessage />
  }

  if (subtitle) {
    return <SubtitlesView />
  }

  return null
}
