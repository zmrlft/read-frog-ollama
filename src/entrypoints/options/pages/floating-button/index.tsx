import { i18n } from '#imports'
import { PageLayout } from '../../components/page-layout'
import { FloatingButtonDisabledSites } from './floating-button-disabled-sites'

export function FloatingButtonPage() {
  return (
    <PageLayout title={i18n.t('options.floatingButton.title')} innerClassName="[&>*]:border-b [&>*:last-child]:border-b-0">
      <FloatingButtonDisabledSites />
    </PageLayout>
  )
}
