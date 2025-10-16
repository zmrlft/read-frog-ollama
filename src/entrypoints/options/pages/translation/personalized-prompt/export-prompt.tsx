import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import { Button } from '@repo/ui/components/button'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { isExportPromptModeAtom, selectedPromptsToExportAtom } from './atoms'
import { downloadJSONFile } from './utils/prompt-file'

export function ExportPrompts() {
  const translateConfig = useAtomValue(configFieldsAtomMap.translate)
  const promptsConfig = translateConfig.promptsConfig
  const patterns = promptsConfig.patterns
  const [selectedPrompts, setSelectedPrompts] = useAtom(selectedPromptsToExportAtom)
  const setIsExportMode = useSetAtom(isExportPromptModeAtom)

  const sortOutDownloadPrompts = patterns
    .filter(pattern => selectedPrompts.includes(pattern.id))
    .map(pattern => ({
      name: pattern.name,
      prompt: pattern.prompt,
    }))

  return (
    <Button
      onClick={() => {
        downloadJSONFile(sortOutDownloadPrompts)
        setIsExportMode(false)
        setSelectedPrompts([])
      }}
      disabled={!selectedPrompts.length}
    >
      <Icon icon="tabler:check" className="size-4" />
      {i18n.t('options.translation.personalizedPrompts.exportPrompt.exportSelected')}
    </Button>
  )
}
