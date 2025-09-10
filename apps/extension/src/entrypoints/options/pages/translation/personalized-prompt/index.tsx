import type { TranslatePromptObj } from '@/types/config/translate'
import { i18n } from '#imports'
import { Icon } from '@iconify/react'
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components/sheet'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { QuickInsertableTextarea } from '@/components/ui/insertable-textarea'
import { configFields } from '@/utils/atoms/config'
import { DEFAULT_TRANSLATE_PROMPT_ID, getTokenCellText, TOKENS } from '@/utils/constants/prompt'
import { ConfigCard } from '../../../components/config-card'
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
  const translateConfig = useAtomValue(configFields.translate)
  const promptsConfig = translateConfig.promptsConfig
  const patterns = promptsConfig.patterns
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])

  return (
    <section className="w-full">
      <header className="w-full text-end mb-4 gap-3 flex justify-end">
        <ImportPrompts />
        <ExportPrompts selectedPrompts={selectedPrompts} />
        <ConfigurePrompt />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-auto p-2">
        {
          patterns.map(pattern => (
            <Card className="h-fit gap-4" key={pattern.id}>
              <CardHeader className="grid-rows-1">
                <CardTitle className="leading-relaxed w-full min-w-0">
                  {
                    isDefaultPrompt(pattern.id)
                      ? i18n.t('options.translation.personalizedPrompts.default')
                      : (
                          <div className="leading-relaxed gap-3 flex items-center w-full">
                            <Checkbox
                              id={`translate-prompt-${pattern.id}`}
                              checked={selectedPrompts.includes(pattern.id)}
                              onCheckedChange={(checked) => {
                                setSelectedPrompts((prev) => {
                                  return checked
                                    ? [...prev, pattern.id]
                                    : prev.filter(id => id !== pattern.id)
                                })
                              }}
                            >
                            </Checkbox>
                            <span className="flex-1 min-w-0 truncate" title={pattern.name}>
                              {pattern.name}
                            </span>
                          </div>
                        )
                  }
                </CardTitle>
                <CardAction className="leading-relaxed">
                  {
                    !isDefaultPrompt(pattern.id)
                    && <DeletePrompt originPrompt={pattern} />
                  }
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 h-16">
                <p className="text-sm text-ellipsis whitespace-pre-wrap line-clamp-3">{pattern.prompt}</p>
              </CardContent>
              <CardFooter className="w-full flex justify-end mt-8">
                <ConfigurePrompt originPrompt={pattern} />
              </CardFooter>
            </Card>
          ))
        }
      </div>
    </section>
  )
}

function ConfigurePrompt({ originPrompt }: { originPrompt?: TranslatePromptObj }) {
  const [translateConfig, setTranslateConfig] = useAtom(configFields.translate)

  const inEdit = !!originPrompt

  const [prompt, setPrompt] = useState<TranslatePromptObj>(originPrompt ?? { id: crypto.randomUUID(), name: '', prompt: '' })

  const promptName = isDefaultPrompt(prompt.id)
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

    setTranslateConfig({
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
    <Sheet>
      <SheetTrigger asChild>
        {
          inEdit
            ? (
                <Button className="size-8 rounded-full">
                  <Icon icon="tabler:pencil" className="size-4" />
                </Button>
              )
            : (
                <Button>
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
        <SheetFooter>
          <SheetClose asChild>
            <Button disabled={isDefaultPrompt(prompt.id)} onClick={configurePrompt}>{i18n.t('options.translation.personalizedPrompts.editPrompt.save')}</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button disabled={isDefaultPrompt(prompt.id)} variant="outline">{i18n.t('options.translation.personalizedPrompts.editPrompt.close')}</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
