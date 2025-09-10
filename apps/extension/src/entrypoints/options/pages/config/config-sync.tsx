import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { ScrollArea } from '@repo/ui/components/scroll-area'
import { kebabCase } from 'case-anything'
import { saveAs } from 'file-saver'
import { useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { toast } from 'sonner'
import { configSchema } from '@/types/config/config'
import { configAtom, writeConfigAtom } from '@/utils/atoms/config'
import { getObjectWithoutAPIKeys } from '@/utils/config/config'
import { runMigration } from '@/utils/config/migration'
import { APP_NAME } from '@/utils/constants/app'
import { CONFIG_SCHEMA_VERSION } from '@/utils/constants/config'
import { logger } from '@/utils/logger'
import { ConfigCard } from '../../components/config-card'

export default function ConfigSync() {
  return (
    <ConfigCard
      title={i18n.t('options.config.sync.title')}
      description={i18n.t('options.config.sync.description')}
    >
      <div className="w-full space-y-4">
        <div className="text-end gap-3 flex justify-end">
          <ImportConfig />
          <ExportConfig />
        </div>

        <ViewCurrentConfig />
      </div>
    </ConfigCard>
  )
}

function ImportConfig() {
  const setConfig = useSetAtom(writeConfigAtom)
  const importConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const fileResult = event.target?.result
          if (typeof fileResult !== 'string') {
            return
          }
          const _config = JSON.parse(fileResult)
          const { storedConfigSchemaVersion: importStoredConfigSchemaVersion } = _config
          if (importStoredConfigSchemaVersion > CONFIG_SCHEMA_VERSION) {
            toast.error(i18n.t('options.config.sync.versionTooNew'))
            return
          }
          let { config } = _config
          if (importStoredConfigSchemaVersion < CONFIG_SCHEMA_VERSION) {
            // migrate
            let currentVersion = importStoredConfigSchemaVersion
            while (currentVersion < CONFIG_SCHEMA_VERSION) {
              const nextVersion = currentVersion + 1
              config = await runMigration(nextVersion, config)
              currentVersion = nextVersion
            }
          }
          if (!configSchema.safeParse(config).success) {
            toast.error(i18n.t('options.config.sync.validationError'))
            logger.error(config, configSchema.safeParse(config).error)
            return
          }
          setConfig(config)
          toast.success(`${i18n.t('options.config.sync.importSuccess')} !`)
        }
        catch (error) {
          logger.error(error)
          toast.error(i18n.t('options.config.sync.importError'))
        }
      }
      reader.readAsText(file)
      reader.onerror = () => toast.error(i18n.t('options.config.sync.importError'))
    }
    finally {
      e.target.value = ''
      e.target.files = null
    }
  }

  return (
    <Button variant="outline" className="p-0">
      <Label htmlFor="import-config-file" className="w-full px-3">
        <Icon icon="tabler:file-download" className="size-4" />
        {i18n.t('options.config.sync.import')}
      </Label>
      <Input
        type="file"
        id="import-config-file"
        className="hidden"
        accept=".json"
        onChange={importConfig}
      />
    </Button>
  )
}

function ExportConfig() {
  const config = useAtomValue(configAtom)

  const exportConfig = (includeApiKeys: boolean) => {
    let exportData = config

    if (!includeApiKeys) {
      exportData = getObjectWithoutAPIKeys(config)
    }

    const json = JSON.stringify({
      config: exportData,
      storedConfigSchemaVersion: CONFIG_SCHEMA_VERSION,
    }, null, 2)
    const blob = new Blob([json], { type: 'text/json' })
    saveAs(blob, `${kebabCase(APP_NAME)}-config-v${CONFIG_SCHEMA_VERSION}.json`)

    toast.success(i18n.t('options.config.sync.exportSuccess'))
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>
          <Icon icon="tabler:file-upload" className="size-4" />
          {i18n.t('options.config.sync.export')}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{i18n.t('options.config.sync.exportOptions.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {i18n.t('options.config.sync.exportOptions.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex !justify-between">
          <AlertDialogCancel>{i18n.t('options.config.sync.exportOptions.cancel')}</AlertDialogCancel>
          <div className="flex gap-2">
            <AlertDialogAction variant="secondary" onClick={() => exportConfig(true)}>
              {i18n.t('options.config.sync.exportOptions.includeAPIKeys')}
            </AlertDialogAction>
            <AlertDialogAction onClick={() => exportConfig(false)}>
              {i18n.t('options.config.sync.exportOptions.excludeAPIKeys')}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ViewCurrentConfig() {
  const config = useAtomValue(configAtom)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="w-full flex flex-col justify-end">
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-3"
      >
        <Icon
          icon={isExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down'}
          className="size-4 mr-2"
        />
        {isExpanded ? i18n.t('options.config.sync.viewConfig.collapse') : i18n.t('options.config.sync.viewConfig.expand')}
      </Button>

      {isExpanded && (
        <ScrollArea className="h-96 w-full rounded-lg border bg-muted">
          <pre className="text-xs p-4 whitespace-pre-wrap break-all overflow-wrap-anywhere">
            {JSON.stringify({
              storedConfigSchemaVersion: CONFIG_SCHEMA_VERSION,
              config,
            }, null, 2)}
          </pre>
        </ScrollArea>
      )}
    </div>
  )
}
