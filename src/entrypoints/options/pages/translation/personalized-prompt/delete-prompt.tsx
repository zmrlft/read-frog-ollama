import type { TranslatePromptObj } from '@/types/config/translate'
import { i18n } from '#imports'
import { Icon } from '@iconify/react/dist/iconify.js'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@repo/ui/components/alert-dialog'
import { Button } from '@repo/ui/components/button'
import { useAtom, useAtomValue } from 'jotai'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { DEFAULT_TRANSLATE_PROMPT_ID } from '@/utils/constants/prompt'
import { isExportPromptModeAtom } from './atoms'

export function DeletePrompt({
  originPrompt,
  className,
  ...props
}: {
  originPrompt: TranslatePromptObj
  className?: string
} & React.ComponentProps<'button'>) {
  const isExportMode = useAtomValue(isExportPromptModeAtom)
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const { patterns, prompt } = translateConfig.promptsConfig
  const deletePrompt = () => {
    void setTranslateConfig({
      promptsConfig: {
        ...translateConfig.promptsConfig,
        patterns: patterns.filter(p => p.id !== originPrompt.id),
        prompt: prompt !== originPrompt.id ? prompt : DEFAULT_TRANSLATE_PROMPT_ID,
      },
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className} disabled={isExportMode} {...props}>
          <Icon icon="tabler:trash" className="size-4"></Icon>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {i18n.t('options.translation.personalizedPrompts.deletePrompt.title')}
            {' '}
            :
            {' '}
            {originPrompt.name}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {i18n.t('options.translation.personalizedPrompts.deletePrompt.description')}
            {' '}
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{i18n.t('options.translation.personalizedPrompts.deletePrompt.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deletePrompt}>{i18n.t('options.translation.personalizedPrompts.deletePrompt.confirm')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
