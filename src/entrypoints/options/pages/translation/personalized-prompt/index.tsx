import type { TranslatePromptObj } from '@/types/config/translate'
import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Separator } from '@repo/ui/components/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components/sheet'
import { cn } from '@repo/ui/lib/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Activity, useState } from 'react'
import { QuickInsertableTextarea } from '@/components/ui/insertable-textarea'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { DEFAULT_TRANSLATE_PROMPT_ID, getTokenCellText, TOKENS } from '@/utils/constants/prompt'
import { ConfigCard } from '../../../components/config-card'
import { isExportPromptModeAtom, selectedPromptsToExportAtom } from './atoms'
import { DeletePrompt } from './delete-prompt'
import { ExportPrompts } from './export-prompt'
import { ImportPrompts } from './import-prompt'

const isDefaultPrompt = (id: string) => id === DEFAULT_TRANSLATE_PROMPT_ID

export function PersonalizedPrompts() {
  return (
    <ConfigCard className="lg:flex-col" title={i18n.t('options.translation.personalizedPrompts.title')} description={i18n.t('options.translation.personalizedPrompts.description')}>
      <PromptList />
    </ConfigCard>
  )
}

function PromptList() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const promptsConfig = translateConfig.promptsConfig
  const patterns = promptsConfig.patterns
  const setSelectedPrompts = useSetAtom(selectedPromptsToExportAtom)
  const [isExportMode, setIsExportMode] = useAtom(isExportPromptModeAtom)
  const currentPromptId = promptsConfig.prompt

  const setCurrentPromptId = (value: string) => {
    void setTranslateConfig({
      promptsConfig: {
        ...promptsConfig,
        prompt: value,
      },
    })
  }

  return (
    <section className="w-full">
      <div className="w-full text-end mb-4 gap-3 flex justify-end">
        {
          isExportMode
            ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsExportMode(false)
                      setSelectedPrompts([])
                    }}
                  >
                    <Icon icon="tabler:x" className="size-4" />
                    {i18n.t('options.translation.personalizedPrompts.exportPrompt.cancel')}
                  </Button>
                  <ExportPrompts />
                </>
              )
            : (
                <>
                  <ImportPrompts />
                  <Button
                    variant="outline"
                    onClick={() => setIsExportMode(true)}
                    disabled={patterns.length === 0}
                  >
                    <Icon icon="tabler:file-import" className="size-4" />
                    {i18n.t('options.translation.personalizedPrompts.export')}
                  </Button>
                  <ConfigurePrompt />
                </>
              )
        }
      </div>
      <PromptGrid
        currentPromptId={currentPromptId}
        setCurrentPromptId={setCurrentPromptId}
      />
    </section>
  )
}

function PromptGrid({
  currentPromptId,
  setCurrentPromptId,
}: {
  currentPromptId: string
  setCurrentPromptId: (value: string) => void
}) {
  const [translateConfig] = useAtom(configFieldsAtomMap.translate)
  const promptsConfig = translateConfig.promptsConfig
  const patterns = promptsConfig.patterns
  const [selectedPrompts, setSelectedPrompts] = useAtom(selectedPromptsToExportAtom)
  const isExportMode = useAtomValue(isExportPromptModeAtom)

  async function handleCardClick(pattern: typeof patterns[number]) {
    if (!isExportMode) {
      setCurrentPromptId(pattern.id)
    }
    else if (!isDefaultPrompt(pattern.id)) {
      setSelectedPrompts((prev) => {
        return prev.includes(pattern.id)
          ? prev.filter(id => id !== pattern.id)
          : [...prev, pattern.id]
      })
    }
  }

  return (
    <div
      aria-label={i18n.t('options.translation.personalizedPrompts.title')}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-auto p-2 select-none"
    >
      {
        patterns.map(pattern => (
          <Card
            className={cn(
              'h-full gap-0 pb-2 py-0 cursor-pointer hover:scale-[1.02] transition-transform duration-30 ease-in-out',
              // for highlight checked card in export mode
              isExportMode ? 'has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5 dark:has-[[aria-checked=true]]:border-primary/70 dark:has-[[aria-checked=true]]:bg-primary/10' : '',
            )}
            key={pattern.id}
          >
            <CardHeader
              className="grid-rows-1 pt-4 px-4 mb-3"
              onClick={() => handleCardClick(pattern)}
            >
              <CardTitle className="w-full min-w-0">
                <div className="leading-relaxed gap-3 flex items-center w-full h-5">
                  <Activity mode={isExportMode && !isDefaultPrompt(pattern.id) ? 'visible' : 'hidden'}>
                    <Checkbox
                      id={`translate-prompt-check-${pattern.id}`}
                      checked={selectedPrompts.includes(pattern.id)}
                      onCheckedChange={(checked) => {
                        setSelectedPrompts((prev) => {
                          return checked
                            ? [...prev, pattern.id]
                            : prev.filter(id => id !== pattern.id)
                        })
                      }}
                    />
                  </Activity>
                  <Label
                    htmlFor={`translate-prompt-check-${isExportMode ? 'check' : 'radio'}-${pattern.id}`}
                    className="flex-1 min-w-0 block truncate cursor-pointer"
                    title={pattern.name}
                  >
                    {isDefaultPrompt(pattern.id)
                      ? i18n.t('options.translation.personalizedPrompts.default')
                      : pattern.name}
                  </Label>
                  <Activity mode={currentPromptId === pattern.id ? 'visible' : 'hidden'}>
                    <Badge className="bg-primary">
                      {i18n.t('options.translation.personalizedPrompts.current')}
                    </Badge>
                  </Activity>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent
              className="flex flex-col gap-4 h-16 flex-1 px-4 mb-3"
              onClick={() => handleCardClick(pattern)}
            >
              <p className="text-sm text-ellipsis whitespace-pre-wrap line-clamp-3">{pattern.prompt}</p>
            </CardContent>
            <Separator className="my-0" />
            <CardFooter className="w-full flex justify-between px-4 items-center py-2 cursor-default">
              <CardAction>
                <Activity mode={!isDefaultPrompt(pattern.id) ? 'visible' : 'hidden'}>
                  <DeletePrompt originPrompt={pattern} />
                </Activity>
              </CardAction>
              <CardAction>
                <ConfigurePrompt originPrompt={pattern} />
              </CardAction>
            </CardFooter>
          </Card>
        ))
      }
    </div>
  )
}

function ConfigurePrompt({
  originPrompt,
  className,
  ...props
}: {
  originPrompt?: TranslatePromptObj
  className?: string
} & React.ComponentProps<'button'>) {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const isExportMode = useAtomValue(isExportPromptModeAtom)
  const isDefault = isDefaultPrompt(originPrompt?.id ?? '')
  const inEdit = !!originPrompt

  const defaultPrompt = { id: crypto.randomUUID(), name: '', prompt: '' }
  const initialPrompt = originPrompt ?? defaultPrompt

  const [prompt, setPrompt] = useState<TranslatePromptObj>(initialPrompt)

  const resetPrompt = () => {
    setPrompt(originPrompt ?? defaultPrompt)
  }

  const promptName = isDefault
    ? i18n.t('options.translation.personalizedPrompts.default')
    : prompt.name

  const sheetTitle = inEdit
    ? i18n.t('options.translation.personalizedPrompts.editPrompt.title')
    : i18n.t('options.translation.personalizedPrompts.addPrompt')

  const clearCachePrompt = () => {
    setPrompt({
      id: crypto.randomUUID(),
      name: '',
      prompt: '',
    })
  }

  const configurePrompt = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!prompt.id || !prompt.name || !prompt.prompt) {
      event.preventDefault()
      return
    }

    const _patterns = translateConfig.promptsConfig.patterns

    void setTranslateConfig({
      promptsConfig: {
        ...translateConfig.promptsConfig,
        patterns: inEdit
          ? _patterns.map(p => p.id === prompt.id ? prompt : p)
          : [..._patterns, prompt],
      },
    })

    clearCachePrompt()
  }

  return (
    <Sheet onOpenChange={(open) => {
      if (open) {
        resetPrompt()
      }
    }}
    >
      <SheetTrigger asChild>
        {
          inEdit
            ? (
                <Button variant="ghost" className={cn('size-8', className)} disabled={isExportMode} {...props}>
                  <Icon icon={isDefault ? 'tabler:eye' : 'tabler:pencil'} className="size-4" />
                </Button>
              )
            : (
                <Button className={className} {...props}>
                  <Icon icon="tabler:plus" className="size-4" />
                  {i18n.t('options.translation.personalizedPrompts.addPrompt')}
                </Button>
              )
        }
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:w-[640px]">
        <SheetHeader>
          <SheetTitle>{sheetTitle}</SheetTitle>
          <div className="grid flex-1 auto-rows-min gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="prompt-name">{i18n.t('options.translation.personalizedPrompts.editPrompt.name')}</Label>
              <Input
                id="prompt-name"
                value={promptName}
                disabled={isDefaultPrompt(prompt.id)}
                onChange={(e) => {
                  setPrompt({
                    ...prompt,
                    name: e.target.value,
                  })
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="prompt">Prompt</Label>
              <QuickInsertableTextarea
                value={prompt.prompt}
                disabled={isDefaultPrompt(prompt.id)}
                className="max-h-100"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt({ ...prompt, prompt: e.target.value })}
                insertCells={TOKENS.map(token => ({
                  text: getTokenCellText(token),
                  description: i18n.t(`options.translation.personalizedPrompts.editPrompt.promptCellInput.${token}`),
                }))}
              />
            </div>
          </div>
        </SheetHeader>
        {!isDefault && (
          <SheetFooter>
            <SheetClose asChild>
              <Button disabled={isDefaultPrompt(prompt.id)} onClick={configurePrompt}>{i18n.t('options.translation.personalizedPrompts.editPrompt.save')}</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button disabled={isDefaultPrompt(prompt.id)} variant="outline">{i18n.t('options.translation.personalizedPrompts.editPrompt.close')}</Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
