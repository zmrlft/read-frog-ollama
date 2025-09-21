import { i18n } from '#imports'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button } from '@repo/ui/components/button'
import { useAtomValue } from 'jotai'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { downloadJSONFile } from './utils/prompt-file'

export function ExportPrompts({ selectedPrompts }: { selectedPrompts: string[] }) {
  const translateConfig = useAtomValue(configFieldsAtomMap.translate)
  const promptsConfig = translateConfig.promptsConfig
  const patterns = promptsConfig.patterns

  const sortOutDownloadPrompts = patterns
    .filter(pattern => selectedPrompts.includes(pattern.id))
    .map(pattern => ({
      name: pattern.name,
      prompt: pattern.prompt,
    }))

  return (
    <Button
      variant="outline"
      onClick={() => {
        downloadJSONFile(sortOutDownloadPrompts)
      }}
      disabled={!selectedPrompts.length}
    >
      <Icon icon="tabler:file-upload" className="size-4" />
      {i18n.t('options.translation.personalizedPrompts.export')}
    </Button>
  )
}
