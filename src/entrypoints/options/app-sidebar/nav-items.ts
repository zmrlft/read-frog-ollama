import { ApiProvidersPage } from '../pages/api-providers'
import { ConfigPage } from '../pages/config'
import { GeneralPage } from '../pages/general'
import { TranslationPage } from '../pages/translation'

export const NAV_ITEMS = {
  '': {
    title: 'general',
    url: '/',
    icon: 'tabler:adjustments-horizontal',
    component: GeneralPage,
  },
  'api-providers': {
    title: 'apiProviders',
    url: '/api-providers',
    icon: 'tabler:api',
    component: ApiProvidersPage,
  },
  'translation': {
    title: 'translation',
    url: '/translation',
    icon: 'ri:translate',
    component: TranslationPage,
  },
  'config': {
    title: 'config',
    url: '/config',
    icon: 'tabler:settings',
    component: ConfigPage,
  },
} as const satisfies Record<string, {
  title: string
  url: string
  icon: string
  component: React.ComponentType
}>
