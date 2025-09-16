import type { APIProviderConfig } from '@/types/config/provider'
import { i18n } from '#imports'
import { Switch } from '@repo/ui/components/switch'
import { cn } from '@repo/ui/lib/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { configFields } from '@/utils/atoms/config'
import { providerConfigAtom } from '@/utils/atoms/provider'
import { getAPIProvidersConfig } from '@/utils/config/helpers'
import { API_PROVIDER_ITEMS } from '@/utils/constants/config'
import { ConfigCard } from '../../components/config-card'
import { selectedProviderIdAtom } from './atoms'
import { ProviderConfigForm } from './provider-config-form'

export function ProvidersConfig() {
  // TODO: add i18n
  return (
    <ConfigCard
      title={i18n.t('options.apiProviders.title')}
      description={i18n.t('options.apiProviders.description')}
      className="lg:flex-col"
    >
      <div className="flex gap-4">
        <ProviderCardList />
        <ProviderConfigForm />
      </div>
    </ConfigCard>
  )
}

function ProviderCardList() {
  const providersConfig = useAtomValue(configFields.providersConfig)
  const apiProvidersConfig = getAPIProvidersConfig(providersConfig)

  return (
    <div className="w-40 lg:w-52 flex flex-col gap-4">
      {apiProvidersConfig.map(providerConfig => (
        <ProviderCard key={providerConfig.name} providerConfig={providerConfig} />
      ))}
    </div>
  )
}

function ProviderCard({ providerConfig }: { providerConfig: APIProviderConfig }) {
  const { id, name, provider, enabled } = providerConfig

  const [selectedProviderId, setSelectedProviderId] = useAtom(selectedProviderIdAtom)
  const setProviderConfig = useSetAtom(providerConfigAtom(id))

  return (
    <div
      className={cn('rounded-xl p-3 border bg-card cursor-pointer', selectedProviderId === id && 'border-primary')}
      onClick={() => setSelectedProviderId(id)}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm flex items-center gap-2 min-w-0">
          <img
            src={API_PROVIDER_ITEMS[provider].logo}
            alt={API_PROVIDER_ITEMS[provider].name}
            className="border-border size-5 p-[3px] rounded-full border bg-white flex-shrink-0"
          />
          <span className="truncate">{name}</span>
        </h3>
        <Switch checked={enabled} onCheckedChange={checked => setProviderConfig({ ...providerConfig, enabled: checked })} />
      </div>
    </div>
  )
}
