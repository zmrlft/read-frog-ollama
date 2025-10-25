import { i18n } from '#imports'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { deepmerge } from 'deepmerge-ts'
import { useAtom } from 'jotai'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { HOTKEY_ITEMS, HOTKEYS } from '@/utils/constants/hotkeys'
import { ConfigCard } from '../../components/config-card'

export function NodeTranslationHotkey() {
  const [translateConfig, setTranslateConfig] = useAtom(
    configFieldsAtomMap.translate,
  )

  return (
    <ConfigCard
      title={i18n.t('options.translation.nodeTranslationHotkey.title')}
      description={i18n.t('options.translation.nodeTranslationHotkey.description')}
    >
      <Select
        value={translateConfig.node.hotkey}
        onValueChange={(value: typeof HOTKEYS[number]) =>
          setTranslateConfig(
            deepmerge(translateConfig, { node: { hotkey: value } }),
          )}
      >
        <SelectTrigger className="w-full">
          <SelectValue asChild>
            <span>
              {HOTKEY_ITEMS[translateConfig.node.hotkey].icon}
              {' '}
              {HOTKEY_ITEMS[translateConfig.node.hotkey].label}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {HOTKEYS.map(item => (
              <SelectItem key={item} value={item}>
                {HOTKEY_ITEMS[item].icon}
                {' '}
                {HOTKEY_ITEMS[item].label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ConfigCard>
  )
}
