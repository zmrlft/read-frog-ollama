import { i18n } from '#imports'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { useAtom, useAtomValue } from 'jotai'
import ProviderIcon from '@/components/provider-icon'
import { configFields } from '@/utils/atoms/config'
import { filterEnabledProvidersConfig, getLLMTranslateProvidersConfig, getNonAPIProvidersConfig, getPureAPIProvidersConfig } from '@/utils/config/helpers'
import { PROVIDER_ITEMS } from '@/utils/constants/config'

export default function TranslateProviderSelector({ className }: { className?: string }) {
  const [translateConfig, setTranslateConfig] = useAtom(configFields.translate)
  const providersConfig = useAtomValue(configFields.providersConfig)
  const filteredProvidersConfig = filterEnabledProvidersConfig(providersConfig)

  return (
    <Select
      value={translateConfig.providerId}
      onValueChange={(value: string) => {
        void setTranslateConfig({
          providerId: value,
        })
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{i18n.t('translateService.aiTranslator')}</SelectLabel>
          {getLLMTranslateProvidersConfig(filteredProvidersConfig).map(({ id, name, provider }) => (
            <SelectItem key={id} value={id}>
              <ProviderIcon logo={PROVIDER_ITEMS[provider].logo} name={name} />
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{i18n.t('translateService.normalTranslator')}</SelectLabel>
          {getNonAPIProvidersConfig(filteredProvidersConfig).map(({ id, name, provider }) => (
            <SelectItem key={id} value={id}>
              <ProviderIcon logo={PROVIDER_ITEMS[provider].logo} name={name} />
            </SelectItem>
          ))}
          {getPureAPIProvidersConfig(filteredProvidersConfig).map(({ id, name, provider }) => (
            <SelectItem key={id} value={id}>
              <ProviderIcon logo={PROVIDER_ITEMS[provider].logo} name={name} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
