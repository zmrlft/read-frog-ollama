import type { APIProviderConfig, APIProviderNames } from '@/types/config/provider'
import { i18n } from '#imports'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { useAtom, useSetAtom } from 'jotai'
import ProviderIcon from '@/components/provider-icon'
import { CUSTOM_LLM_PROVIDER_NAMES, NON_CUSTOM_LLM_PROVIDER_NAMES, PURE_API_PROVIDER_NAMES } from '@/types/config/provider'
import { configFields } from '@/utils/atoms/config'
import { API_PROVIDER_ITEMS, DEFAULT_PROVIDER_CONFIG } from '@/utils/constants/providers'
import { isDarkMode } from '@/utils/tailwind'
import { selectedProviderIdAtom } from './atoms'

export const PROVIDER_GROUPS = {
  llmProviders: NON_CUSTOM_LLM_PROVIDER_NAMES,
  customProviders: CUSTOM_LLM_PROVIDER_NAMES,
  pureTranslationProviders: PURE_API_PROVIDER_NAMES,
} as const

export default function AddProviderDialog({ onClose }: { onClose: () => void }) {
  const [providersConfig, setProvidersConfig] = useAtom(configFields.providersConfig)
  const setSelectedProviderId = useSetAtom(selectedProviderIdAtom)

  const handleAddProvider = async (providerType: APIProviderNames) => {
    const existingProviderNameSet = new Set(providersConfig.map(p => p.name))
    let providerName = API_PROVIDER_ITEMS[providerType].name
    for (let i = 0; i <= providersConfig.length; i++) {
      const currentProviderName = i === 0 ? API_PROVIDER_ITEMS[providerType].name : `${API_PROVIDER_ITEMS[providerType].name} ${i}`
      if (!existingProviderNameSet.has(currentProviderName)) {
        providerName = currentProviderName
        break
      }
    }

    const newProvider: APIProviderConfig = {
      ...structuredClone(DEFAULT_PROVIDER_CONFIG[providerType]),
      id: crypto.randomUUID(),
      name: providerName,
    }

    const updatedProviders = [...providersConfig, newProvider]
    await setProvidersConfig(updatedProviders)
    setSelectedProviderId(newProvider.id)
    onClose()
  }

  return (
    <DialogContent className="md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{i18n.t('options.apiProviders.dialog.title')}</DialogTitle>
        <DialogDescription>
          {i18n.t('options.apiProviders.dialog.description')}
        </DialogDescription>
      </DialogHeader>
      {Object.entries(PROVIDER_GROUPS).map(([groupTitle, providerTypes]) => (
        <ProviderButtonGroup key={groupTitle} groupTitle={i18n.t(`options.apiProviders.dialog.groups.${groupTitle as keyof typeof PROVIDER_GROUPS}`)} providerTypes={providerTypes} handleAddProvider={handleAddProvider} />
      ))}
    </DialogContent>
  )
}

function ProviderButtonGroup({ groupTitle, providerTypes, handleAddProvider }: { groupTitle: string, providerTypes: readonly APIProviderNames[], handleAddProvider: (providerType: APIProviderNames) => void }) {
  return (
    <div>
      <h3 className="text-base font-base text-input-foreground text-center sm:text-left">{groupTitle}</h3>
      <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 py-3">
        {providerTypes.map(providerType => (
          <ProviderButton key={providerType} providerType={providerType} handleAddProvider={handleAddProvider} />
        ))}
      </div>
    </div>
  )
}

function ProviderButton({ providerType, handleAddProvider }: { providerType: APIProviderNames, handleAddProvider: (providerType: APIProviderNames) => void }) {
  return (
    <button
      type="button"
      key={providerType}
      className="h-auto p-3 flex flex-col items-center space-y-2 hover:bg-muted/70 rounded-lg"
      onClick={() => handleAddProvider(providerType)}
    >
      <ProviderIcon logo={API_PROVIDER_ITEMS[providerType].logo(isDarkMode())} size="lg" />
      <span className="text-xs font-light w-full line-clamp-2 flex-1 flex items-center justify-center">
        {API_PROVIDER_ITEMS[providerType].name}
      </span>
    </button>
  )
}
