import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip'

import { useAtom, useAtomValue } from 'jotai'
import ProviderIcon from '@/components/provider-icon'
import { configFields } from '@/utils/atoms/config'
import { getLLMTranslateProvidersConfig, getNonAPIProvidersConfig, getPureAPIProviderConfig } from '@/utils/config/helpers'
import { PROVIDER_ITEMS } from '@/utils/constants/config'

export default function TranslateProviderSelector() {
  const [translateConfig, setTranslateConfig] = useAtom(configFields.translate)
  const providersConfig = useAtomValue(configFields.providersConfig)

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium flex items-center gap-1.5">
        {i18n.t('translateService.title')}
        <Tooltip>
          <TooltipTrigger asChild>
            <Icon icon="tabler:help" className="size-3 text-blue-300 dark:text-blue-700/70" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {i18n.t('translateService.description')}
            </p>
          </TooltipContent>
        </Tooltip>
      </span>
      <Select
        value={translateConfig.providerName}
        onValueChange={(value: string) => {
          setTranslateConfig({
            ...translateConfig,
            providerName: value,
          })
        }}
      >
        <SelectTrigger className="bg-input/50 hover:bg-input !h-7 w-31 cursor-pointer pr-1.5 pl-2.5 outline-none">
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
    </div>
  )
}
