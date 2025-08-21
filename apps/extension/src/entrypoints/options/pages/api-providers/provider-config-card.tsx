import type { APIProviderNames } from '@/types/config/provider'
import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import { Button } from '@repo/ui/components/button'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Input } from '@repo/ui/components/input'
import { cn } from '@repo/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import LoadingDots from '@/components/loading-dots'
import { configFields } from '@/utils/atoms/config'
import { API_PROVIDER_ITEMS, DEFAULT_TRANSLATE_MODELS } from '@/utils/constants/config'
import { aiTranslate, deeplxTranslate } from '@/utils/host/translate/api'
import { ConfigCard } from '../../components/config-card'
import { FieldWithLabel } from '../../components/field-with-label'

export function ProviderConfigCard({ provider }: { provider: APIProviderNames }) {
  const [providersConfig, setProvidersConfig] = useAtom(configFields.providersConfig)
  const [showAPIKey, setShowAPIKey] = useState(false)

  return (
    <ConfigCard
      title={(
        <div className="flex items-center gap-2">
          <img
            src={API_PROVIDER_ITEMS[provider].logo}
            alt={API_PROVIDER_ITEMS[provider].name}
            className="border-border size-5 p-[3px] rounded-full border bg-white"
          />
          {API_PROVIDER_ITEMS[provider].name}
        </div>
      )}
      description={i18n.t(`options.apiProviders.description.${provider}`)}
    >
      <div className="flex flex-col gap-y-4">
        <FieldWithLabel
          label={(
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium">
                API Key
              </span>
              <ConnectionTestButton
                provider={provider}
              />
            </div>
          )}
          id={`${provider}-apiKey`}
        >
          <Input
            value={providersConfig[provider].apiKey}
            type={showAPIKey ? 'text' : 'password'}
            onChange={e =>
              setProvidersConfig({
                ...providersConfig,
                [provider]: {
                  ...providersConfig[provider],
                  apiKey: e.target.value,
                },
              })}
          />
          <div className="mt-0.5 flex items-center space-x-2">
            <Checkbox
              id={`apiKey-${provider}`}
              checked={showAPIKey}
              onCheckedChange={checked => setShowAPIKey(checked === true)}
            />
            <label
              htmlFor={`apiKey-${provider}`}
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {i18n.t('options.apiProviders.apiKey.showAPIKey')}
            </label>
          </div>
        </FieldWithLabel>

        <AdvancedProviderConfig provider={provider} />
      </div>
    </ConfigCard>
  )
}

function ConnectionSuccessIcon() {
  return (
    <div className="flex items-center justify-center size-5 rounded-full bg-green-200 dark:bg-green-800/50">
      <Icon
        icon="tabler:check"
        className="size-3.5 text-green-700 dark:text-green-300 stroke-[2.5]"
      />
    </div>
  )
}

function ConnectionErrorIcon() {
  return (
    <div className="flex items-center justify-center size-5 rounded-full bg-red-200 dark:bg-red-800/50">
      <Icon
        icon="tabler:x"
        className="size-3.5 text-red-700 dark:text-red-300 stroke-[2.5]"
      />
    </div>
  )
}

const ConnectionTestResultIconMap = {
  success: <ConnectionSuccessIcon />,
  error: <ConnectionErrorIcon />,
}

function ConnectionTestButton({ provider }: { provider: APIProviderNames }) {
  const providersConfig = useAtomValue(configFields.providersConfig)
  const { apiKey, baseURL } = providersConfig[provider]

  const mutation = useMutation({
    mutationKey: ['apiConnection', provider],
    mutationFn: async () => {
      if (provider === 'deeplx') {
        await deeplxTranslate('Hi', 'en', 'zh')
      }
      else {
        const modelName = DEFAULT_TRANSLATE_MODELS[provider].model
        await aiTranslate(provider, modelName, 'Hi')
      }
    },
  })

  const handleTestConnection = () => {
    mutation.mutate()
  }

  useEffect(() => {
    mutation.reset()
  }, [apiKey, baseURL])

  const testResult = mutation.isSuccess ? 'success' : mutation.isError ? 'error' : null
  const ConnectionTestResultIcon = testResult ? ConnectionTestResultIconMap[testResult] : null

  return (
    <div className="flex items-center gap-2">
      {ConnectionTestResultIcon}
      <Button
        size="sm"
        variant="outline"
        onClick={handleTestConnection}
        disabled={mutation.isPending || (!apiKey && provider !== 'deeplx')}
        className="h-7 px-3"
      >
        {mutation.isPending
          ? (
              <div className="flex items-center gap-2">
                <LoadingDots className="scale-75" />
                <span className="text-xs">
                  {i18n.t('options.apiProviders.testConnection.testing')}
                </span>
              </div>
            )
          : (
              <span className="text-xs">
                {i18n.t('options.apiProviders.testConnection.button')}
              </span>
            )}
      </Button>
    </div>
  )
}

function AdvancedProviderConfig({ provider }: { provider: APIProviderNames }) {
  const [providersConfig, setProvidersConfig] = useAtom(configFields.providersConfig)
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div>
      <button
        type="button"
        className={cn('text-sm font-medium text-blue-600 hover:underline', showAdvanced && 'mb-2')}
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? i18n.t('options.apiProviders.advancedConfig.hide') : i18n.t('options.apiProviders.advancedConfig.show')}
      </button>

      {showAdvanced && (
        <FieldWithLabel id={`${provider}-baseURL`} label="Base URL">
          <Input
            className="mt-1 mb-2"
            value={providersConfig[provider].baseURL}
            onChange={e =>
              setProvidersConfig({
                ...providersConfig,
                [provider]: {
                  ...providersConfig[provider],
                  baseURL: e.target.value,
                },
              })}
          />
        </FieldWithLabel>
      )}
    </div>
  )
}
