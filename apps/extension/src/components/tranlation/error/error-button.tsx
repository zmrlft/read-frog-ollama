import { Icon } from '@iconify/react'
import { use } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { ShadowWrapperContext } from '@/utils/react-shadow-host/create-shadow-host'

export function ErrorButton({ error }: { error: Error }) {
  const shadowWrapper = use(ShadowWrapperContext)

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <Icon icon="tabler:alert-circle" className="size-4 text-destructive hover:text-destructive/90 cursor-pointer" />
      </HoverCardTrigger>
      <HoverCardContent className="w-64 notranslate" container={shadowWrapper} asChild>
        <Alert variant="destructive">
          <Icon icon="tabler:alert-circle" className="size-4" />
          <AlertTitle>Translation Error</AlertTitle>
          <AlertDescription className="break-all">
            {error.message}
          </AlertDescription>
        </Alert>
      </HoverCardContent>
    </HoverCard>
  )
}
