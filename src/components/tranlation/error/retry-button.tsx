import type { TransNode } from '@/types/dom'
import { Icon } from '@iconify/react'
import { use } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { translateNodes } from '@/utils/host/translate/node-manipulation'
import { ShadowWrapperContext } from '@/utils/react-shadow-host/create-shadow-host'

export function RetryButton({ nodes }: { nodes: TransNode[] }) {
  const shadowWrapper = use(ShadowWrapperContext)

  const handleRetry = async () => {
    await translateNodes(nodes)
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
