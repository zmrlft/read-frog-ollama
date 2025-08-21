import { i18n } from '#imports'
import { API_PROVIDER_NAMES } from '@/types/config/provider'
import { PageLayout } from '../../components/page-layout'
import { ProviderConfigCard } from './provider-config-card'

export function ApiProvidersPage() {
  return (
    <PageLayout title={i18n.t('options.apiProviders.title')} innerClassName="[&>*]:border-b [&>*:last-child]:border-b-0">
      {API_PROVIDER_NAMES.map(provider => (
        <ProviderConfigCard key={provider} provider={provider} />
      ))}
    </PageLayout>
  )
}
