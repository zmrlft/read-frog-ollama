import type { ReadProviderNames } from '@/types/config/provider'
import { i18n } from '#imports'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Input } from '@repo/ui/components/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select'
import { useAtom, useAtomValue } from 'jotai'
import ProviderIcon from '@/components/provider-icon'
import { READ_PROVIDER_MODELS } from '@/types/config/provider'
import { configFields } from '@/utils/atoms/config'
import { readProviderConfigAtom, updateLLMProviderConfig } from '@/utils/atoms/provider'
import { getLLMTranslateProvidersConfig } from '@/utils/config/helpers'
import { PROVIDER_ITEMS } from '@/utils/constants/config'
import { ConfigCard } from '../../components/config-card'
import { FieldWithLabel } from '../../components/field-with-label'
import { SetApiKeyWarning } from '../../components/set-api-key-warning'

export function ReadConfig() {
  return (
    <ConfigCard title={i18n.t('options.general.readConfig.title')} description={i18n.t('options.general.readConfig.description')}>
      <div className="flex flex-col gap-4">
        <ReadProviderSelector />
        <ReadModelSelector />
      </div>
    </ConfigCard>
  )
}

function ReadProviderSelector() {
  const [readConfig, setReadConfig] = useAtom(configFields.read)
  const providersConfig = useAtomValue(configFields.providersConfig)
  const readProviderConfig = useAtomValue(readProviderConfigAtom)

  return (
    <FieldWithLabel
      id="readProvider"
      label={(
        <div className="flex gap-2">
          {i18n.t('options.general.readConfig.provider')}
          {!readProviderConfig.apiKey && <SetApiKeyWarning />}
        </div>
      )}
    >
      <Select
        value={readConfig.providerName}
        onValueChange={(value: ReadProviderNames) =>
          setReadConfig(
            { ...readConfig, providerName: value },
          )}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {getLLMTranslateProvidersConfig(providersConfig).map(({ name, provider }) => (
              <SelectItem key={name} value={name}>
                <ProviderIcon logo={PROVIDER_ITEMS[provider].logo} name={name} />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FieldWithLabel>
  )
}

function ReadModelSelector() {
  const [readProviderConfig, setReadProviderConfig] = useAtom(readProviderConfigAtom)
  const provider = readProviderConfig.provider
  const modelConfig = readProviderConfig.models.read

  return (
    <FieldWithLabel id="readModel" label={i18n.t('options.general.readConfig.model.title')}>
      {modelConfig.isCustomModel
        ? (
            <Input
              value={modelConfig.customModel ?? ''}
              onChange={e =>
                setReadProviderConfig(
                  updateLLMProviderConfig(readProviderConfig, {
                    models: {
                      read: {
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
                setReadProviderConfig(
                  updateLLMProviderConfig(readProviderConfig, {
                    models: {
                      read: {
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
                  {READ_PROVIDER_MODELS[provider].map(model => (
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
          id={`isCustomModel-read-${provider}`}
          checked={modelConfig.isCustomModel}
          onCheckedChange={(checked) => {
            if (checked === false) {
              setReadProviderConfig(
                updateLLMProviderConfig(readProviderConfig, {
                  models: {
                    read: {
                      customModel: null,
                      isCustomModel: false,
                    },
                  },
                }),
              )
            }
            else {
              setReadProviderConfig(
                updateLLMProviderConfig(readProviderConfig, {
                  models: {
                    read: {
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
          htmlFor={`isCustomModel-read-${provider}`}
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {i18n.t('options.general.readConfig.model.enterCustomModel')}
        </label>
      </div>
    </FieldWithLabel>
  )
}
