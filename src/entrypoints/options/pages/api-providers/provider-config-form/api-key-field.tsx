import type { APIProviderConfig } from '@/types/config/provider'
import { i18n } from '#imports'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button } from '@repo/ui/components/button'
import { Checkbox } from '@repo/ui/components/checkbox'
import { useStore } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import LoadingDots from '@/components/loading-dots'
import { getObjectWithoutAPIKeys } from '@/utils/config/config'
import { DEFAULT_CONFIG } from '@/utils/constants/config'
import { executeTranslate } from '@/utils/host/translate/translate-text'
import { withForm } from './form'

export const APIKeyField = withForm({
  ...{ defaultValues: {} as APIProviderConfig },
  render: function Render({ form }) {
    // const providerConfig = form.state.values
    const [showAPIKey, setShowAPIKey] = useState(false)

    const providerConfig = useStore(form.store, state => state.values)

    return (
      <form.AppField name="apiKey">
        {field => (
          <div className="flex flex-col gap-2">
            <field.InputField
              formForSubmit={form}
              label={
                (
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-medium">
                      API Key
                    </span>
                    <ConnectionTestButton
                      providerConfig={providerConfig}
                    />
                  </div>
                )
              }
              type={showAPIKey ? 'text' : 'password'}
            />
            <div className="mt-0.5 flex items-center space-x-2">
              <Checkbox
                id={`apiKey-${providerConfig.id}`}
                checked={showAPIKey}
                onCheckedChange={checked => setShowAPIKey(checked === true)}
              />
              <label
                htmlFor={`apiKey-${providerConfig.id}`}
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {i18n.t('options.apiProviders.apiKey.showAPIKey')}
              </label>
            </div>
          </div>
        )}
      </form.AppField>
    )
  },
})

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
