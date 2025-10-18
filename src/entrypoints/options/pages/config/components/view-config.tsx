import type { ButtonProps } from '@repo/ui/components/button'
import type { Config } from '@/types/config/config'
import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import { Button } from '@repo/ui/components/button'
import { ScrollArea } from '@repo/ui/components/scroll-area'
import { useState } from 'react'
import { CONFIG_SCHEMA_VERSION, CONFIG_SCHEMA_VERSION_STORAGE_KEY, CONFIG_STORAGE_KEY } from '@/utils/constants/config'

export function ViewConfig({ config, configSchemaVersion, size = 'default' }: { config: Config, configSchemaVersion?: number, size?: ButtonProps['size'] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="w-full flex flex-col justify-end">
      <Button
        variant="outline"
        size={size}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icon
          icon={isExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down'}
        />
        {isExpanded ? i18n.t('options.config.sync.viewConfig.collapse') : i18n.t('options.config.sync.viewConfig.expand')}
      </Button>

      {isExpanded && (
        <ScrollArea className="h-96 w-full rounded-lg border bg-muted mt-3">
          <pre className="text-xs p-4 whitespace-pre-wrap break-all overflow-wrap-anywhere">
            {JSON.stringify({
              [CONFIG_SCHEMA_VERSION_STORAGE_KEY]: configSchemaVersion ?? CONFIG_SCHEMA_VERSION,
              [CONFIG_STORAGE_KEY]: config,
            }, null, 2)}
          </pre>
        </ScrollArea>
      )}
    </div>
  )
}
