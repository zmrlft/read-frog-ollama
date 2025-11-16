import type { APICallError } from 'ai'
import { Icon } from '@iconify/react'
import { Alert, AlertDescription, AlertTitle } from '@read-frog/ui/components/alert'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@read-frog/ui/components/hover-card'
import { use } from 'react'
import { ShadowWrapperContext } from '@/utils/react-shadow-host/create-shadow-host'

export function ErrorButton({ error }: { error: APICallError }) {
  const shadowWrapper = use(ShadowWrapperContext)

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <Icon icon="tabler:alert-circle" className="size-4 text-destructive hover:text-destructive/90 cursor-pointer" />
      </HoverCardTrigger>
      <HoverCardContent className="w-64 notranslate" container={shadowWrapper} asChild>
        <Alert>
          <Icon icon="tabler:alert-circle" className="size-4 text-red-500!" />
          <AlertTitle>Translation Error</AlertTitle>
          <AlertDescription className="break-all">
            <StatusCode statusCode={error.statusCode ?? 500} />
            <p className="text-zinc-900 dark:text-zinc-100">{error.message || 'Something went wrong'}</p>
          </AlertDescription>
        </Alert>
      </HoverCardContent>
    </HoverCard>
  )
}

function StatusCode({ statusCode }: { statusCode: number }) {
  const getStatusCodeColor = (code: number) => {
    const firstDigit = Math.floor(code / 100)
    switch (firstDigit) {
      case 2: return 'bg-green-500' // 2xx - Success
      case 3: return 'bg-blue-500' // 3xx - Redirection
      case 4: return 'bg-yellow-500' // 4xx - Client Error
      case 5: return 'bg-red-500' // 5xx - Server Error
      default: return 'bg-gray-500' // Unknown
    }
  }

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-2 h-2 rounded-full ${getStatusCodeColor(statusCode)}`} />
      <span className="text-sm font-medium">
        Status Code:
        {statusCode}
      </span>
    </div>
  )
}
