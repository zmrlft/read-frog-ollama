import { i18n } from '#imports'
import { useAtomValue } from 'jotai'
import { isAPIProviderConfig } from '@/types/config/provider'
import { configFields } from '@/utils/atoms/config'
import { PageLayout } from '../../components/page-layout'
import { ProviderConfigCard } from './provider-config-card'

export function ApiProvidersPage() {
  const providersConfig = useAtomValue(configFields.providersConfig)
  const apiProvidersConfig = providersConfig.filter(providerConfig => isAPIProviderConfig(providerConfig))

  return (
    <PageLayout title={i18n.t('options.apiProviders.title')} innerClassName="[&>*]:border-b [&>*:last-child]:border-b-0">
      {apiProvidersConfig.map(providerConfig => (
        <ProviderConfigCard key={providerConfig.name} providerConfig={providerConfig} />
      ))}
    </PageLayout>
  )
}
