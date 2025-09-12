import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { useAtom, useAtomValue } from 'jotai'
import ProviderIcon from '@/components/provider-icon'
import { configFields } from '@/utils/atoms/config'
import { getReadProvidersConfig } from '@/utils/config/helpers'
import { PROVIDER_ITEMS } from '@/utils/constants/config'

export default function ReadProviderSelector({ className, hideChevron = false, customTrigger }: { className?: string, hideChevron?: boolean, customTrigger?: React.ReactNode }) {
  const [readConfig, setReadConfig] = useAtom(configFields.read)
  const providersConfig = useAtomValue(configFields.providersConfig)

  return (
    <Select
      value={readConfig.providerName}
      onValueChange={(value: string) => {
        setReadConfig({
          providerName: value,
        })
      }}
    >
      <SelectTrigger className={className} hideChevron={hideChevron}>
        {customTrigger || <SelectValue />}
      </SelectTrigger>
      <SelectContent>
        {getReadProvidersConfig(providersConfig).map(({ name, provider }) => (
          <SelectItem key={name} value={name}>
            <ProviderIcon logo={PROVIDER_ITEMS[provider].logo} name={name} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
