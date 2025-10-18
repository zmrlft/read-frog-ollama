import type { Config } from '@/types/config/config'
import { i18n } from '#imports'
import { useMutation } from '@tanstack/react-query'
import { kebabCase } from 'case-anything'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { getObjectWithoutAPIKeys } from '@/utils/config/config'
import { APP_NAME } from '@/utils/constants/app'
import { CONFIG_SCHEMA_VERSION_STORAGE_KEY, CONFIG_STORAGE_KEY } from '@/utils/constants/config'

interface UseExportConfigOptions {
  config: Config
  schemaVersion: number
  onSuccess?: () => void
}

export function useExportConfig({ config, schemaVersion, onSuccess }: UseExportConfigOptions) {
  return useMutation({
    mutationFn: async (includeApiKeys: boolean) => {
      let exportConfig = config

      if (!includeApiKeys) {
        exportConfig = getObjectWithoutAPIKeys(config)
      }

      const json = JSON.stringify({
        [CONFIG_STORAGE_KEY]: exportConfig,
        [CONFIG_SCHEMA_VERSION_STORAGE_KEY]: schemaVersion,
      }, null, 2)
      const blob = new Blob([json], { type: 'text/json' })
      saveAs(blob, `${kebabCase(APP_NAME)}-config-v${schemaVersion}.json`)
    },
    onSuccess: () => {
      toast.success(i18n.t('options.config.sync.exportSuccess'))
      onSuccess?.()
    },
  })
}
