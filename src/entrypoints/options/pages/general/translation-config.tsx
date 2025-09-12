import type { PageTranslateRange } from '@/types/config/translate'
import { i18n } from '#imports'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Input } from '@repo/ui/components/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { deepmerge } from 'deepmerge-ts'
import { useAtom, useAtomValue } from 'jotai'
import TranslateProviderSelector from '@/components/provider/translate-provider-selector'
import { isAPIProviderConfig, isLLMTranslateProviderConfig, TRANSLATE_PROVIDER_MODELS } from '@/types/config/provider'
import { pageTranslateRangeSchema } from '@/types/config/translate'
import { configFields } from '@/utils/atoms/config'
import { translateProviderConfigAtom, updateLLMProviderConfig } from '@/utils/atoms/provider'
import { ConfigCard } from '../../components/config-card'
import { FieldWithLabel } from '../../components/field-with-label'
import { SetApiKeyWarning } from '../../components/set-api-key-warning'

export default function TranslationConfig() {
  return (
    <ConfigCard title={i18n.t('options.general.translationConfig.title')} description={i18n.t('options.general.translationConfig.description')}>
      <div className="space-y-4">
        <TranslateProviderSelectorField />
        <TranslateModelSelector />
        <RangeSelector />
      </div>
    </ConfigCard>
  )
}

function RangeSelector() {
  const [translateConfig, setTranslateConfig] = useAtom(configFields.translate)
  return (
    <FieldWithLabel id="translateRange" label={i18n.t('options.general.translationConfig.translateRange.title')}>
      <Select
        value={translateConfig.page.range}
        onValueChange={(value: PageTranslateRange) =>
          setTranslateConfig(
            deepmerge(translateConfig, { page: { range: value } }),
          )}
      >
        <SelectTrigger className="w-full">
          <SelectValue asChild>
            <span>
              {i18n.t(
                `options.general.translationConfig.translateRange.range.${translateConfig.page.range}`,
              )}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {pageTranslateRangeSchema.options.map(range => (
              <SelectItem key={range} value={range}>
                {i18n.t(
                  `options.general.translationConfig.translateRange.range.${range}`,
                )}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldWithLabel>
  )
}

function TranslateProviderSelectorField() {
  const translateProviderConfig = useAtomValue(translateProviderConfigAtom)

  // some deeplx providers don't need api key
  const needSetAPIKey = translateProviderConfig && isAPIProviderConfig(translateProviderConfig) && translateProviderConfig.provider !== 'deeplx' && translateProviderConfig.apiKey === undefined

  return (
    <FieldWithLabel
      id="translateProvider"
      label={(
        <div className="flex gap-2">
          {i18n.t('options.general.translationConfig.provider')}
          {needSetAPIKey && <SetApiKeyWarning />}
        </div>
      )}
    >
      <TranslateProviderSelector className="w-full" />
    </FieldWithLabel>
  )
}

function TranslateModelSelector() {
  const [translateProviderConfig, setTranslateProviderConfig] = useAtom(translateProviderConfigAtom)

  if (!translateProviderConfig || !isLLMTranslateProviderConfig(translateProviderConfig)) {
    return null
  }

  const provider = translateProviderConfig.provider
  const modelConfig = translateProviderConfig.models.translate

  return (
    <FieldWithLabel id="translateModel" label={i18n.t('options.general.translationConfig.model.title')}>
      {modelConfig.isCustomModel
        ? (
            <Input
              value={modelConfig.customModel ?? ''}
              onChange={e =>
                setTranslateProviderConfig(
                  updateLLMProviderConfig(translateProviderConfig, {
                    models: {
                      translate: {
                        customModel: e.target.value === '' ? null : e.target.value,
                      },
                    },
                  }),
                )}
            />
          )
        : (
            <Select
              value={modelConfig.model}
              onValueChange={value =>
                setTranslateProviderConfig(
                  updateLLMProviderConfig(translateProviderConfig, {
                    models: {
                      translate: {
                        model: value as any,
                      },
                    },
                  }),
                )}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TRANSLATE_PROVIDER_MODELS[provider].map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
      <div className="mt-0.5 flex items-center space-x-2">
        <Checkbox
          id={`isCustomModel-translate-${provider}`}
          checked={modelConfig.isCustomModel}
          onCheckedChange={(checked) => {
            if (checked === false) {
              setTranslateProviderConfig(
                updateLLMProviderConfig(translateProviderConfig, {
                  models: {
                    translate: {
                      customModel: null,
                      isCustomModel: false,
                    },
                  },
                }),
              )
            }
            else {
              setTranslateProviderConfig(
                updateLLMProviderConfig(translateProviderConfig, {
                  models: {
                    translate: {
                      customModel: modelConfig.model,
                      isCustomModel: true,
                    },
                  },
                }),
              )
            }
          }}
        />
        <label
          htmlFor={`isCustomModel-translate-${provider}`}
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {i18n.t('options.general.translationConfig.model.enterCustomModel')}
        </label>
      </div>
    </FieldWithLabel>
  )
}
