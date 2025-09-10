import type { APIProviderConfig } from '@/types/config/provider'
import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import { Button } from '@repo/ui/components/button'
import { Checkbox } from '@repo/ui/components/checkbox'
import { Input } from '@repo/ui/components/input'
import { cn } from '@repo/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import LoadingDots from '@/components/loading-dots'
import { providerConfigAtom } from '@/utils/atoms/provider'
import { getObjectWithoutAPIKeys } from '@/utils/config/config'
import { API_PROVIDER_ITEMS, DEFAULT_CONFIG } from '@/utils/constants/config'
import { executeTranslate } from '@/utils/host/translate/translate-text'
import { ConfigCard } from '../../components/config-card'
import { FieldWithLabel } from '../../components/field-with-label'

export function ProviderConfigCard({ providerConfig }: { providerConfig: APIProviderConfig }) {
  const setProviderConfig = useSetAtom(providerConfigAtom(providerConfig.name))
  // const [providersConfig, setProvidersConfig] = useAtom(configFields.providersConfig)
  const [showAPIKey, setShowAPIKey] = useState(false)

  const provider = providerConfig.provider

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
                providerConfig={providerConfig}
              />
            </div>
          )}
          id={`${provider}-apiKey`}
        >
          <Input
            value={providerConfig.apiKey}
            type={showAPIKey ? 'text' : 'password'}
            onChange={e =>
              setProviderConfig({
                ...providerConfig,
                apiKey: e.target.value,
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

        <AdvancedProviderConfig providerConfig={providerConfig} />
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

function ConnectionTestButton({ providerConfig }: { providerConfig: APIProviderConfig }) {
  const { apiKey, baseURL, provider } = providerConfig

  const mutation = useMutation({
    // for safety, we should not include apiKey in the mutationKey
    mutationKey: ['apiConnection', getObjectWithoutAPIKeys(providerConfig)],
    mutationFn: async () => {
      return await executeTranslate('Hi', DEFAULT_CONFIG.language, providerConfig)
    },
  })

  const handleTestConnection = () => {
    mutation.mutate()
  }

  useEffect(() => {
    mutation.reset()
  }, [provider, apiKey, baseURL])

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

function AdvancedProviderConfig({ providerConfig }: { providerConfig: APIProviderConfig }) {
  const setProviderConfig = useSetAtom(providerConfigAtom(providerConfig.name))
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { provider, baseURL } = providerConfig

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
            value={baseURL}
            onChange={e =>
              setProviderConfig({
                ...providerConfig,
                baseURL: e.target.value,
              })}
          />
        </FieldWithLabel>
      )}
    </div>
  )
}
