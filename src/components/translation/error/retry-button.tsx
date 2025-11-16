import { Icon } from '@iconify/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@read-frog/ui/components/tooltip'
import { useAtomValue } from 'jotai'
import { use } from 'react'
import { configAtom } from '@/utils/atoms/config'
import { translateNodesBilingualMode, translateNodeTranslationOnlyMode } from '@/utils/host/translate/node-manipulation'
import { ShadowWrapperContext } from '@/utils/react-shadow-host/create-shadow-host'

export function RetryButton({ nodes }: { nodes: ChildNode[] }) {
  const shadowWrapper = use(ShadowWrapperContext)
  const config = useAtomValue(configAtom)
  const translationMode = config.translate.mode

  const handleRetry = async () => {
    const walkId = crypto.randomUUID()
    if (translationMode === 'bilingual') {
      await translateNodesBilingualMode(nodes, walkId, config)
    }
    else if (translationMode === 'translationOnly') {
      await translateNodeTranslationOnlyMode(nodes, walkId, config)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleRetry}
        >
          <Icon icon="tabler:reload" className="size-4 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400" />
        </button>
      </TooltipTrigger>
      <TooltipContent container={shadowWrapper} side="bottom" className="notranslate">
        Retry translation
      </TooltipContent>
    </Tooltip>
  )
}
