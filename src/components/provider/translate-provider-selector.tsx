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
import { getLLMTranslateProvidersConfig, getNonAPIProvidersConfig, getPureAPIProviderConfig } from '@/utils/config/helpers'
import { PROVIDER_ITEMS } from '@/utils/constants/config'

export default function TranslateProviderSelector({ className }: { className?: string }) {
  const [translateConfig, setTranslateConfig] = useAtom(configFields.translate)
  const providersConfig = useAtomValue(configFields.providersConfig)

  return (
    <Select
      value={translateConfig.providerName}
      onValueChange={(value: string) => {
        setTranslateConfig({
          providerName: value,
        })
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{i18n.t('translateService.aiTranslator')}</SelectLabel>
          {getLLMTranslateProvidersConfig(providersConfig).map(({ name, provider }) => (
            <SelectItem key={name} value={name}>
              <ProviderIcon logo={PROVIDER_ITEMS[provider].logo} name={name} />
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>{i18n.t('translateService.normalTranslator')}</SelectLabel>
          {getNonAPIProvidersConfig(providersConfig).map(({ name, provider }) => (
            <SelectItem key={name} value={name}>
              <ProviderIcon logo={PROVIDER_ITEMS[provider].logo} name={name} />
            </SelectItem>
          ))}
          {getPureAPIProviderConfig(providersConfig).map(({ name, provider }) => (
            <SelectItem key={name} value={name}>
              <ProviderIcon logo={PROVIDER_ITEMS[provider].logo} name={name} />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
