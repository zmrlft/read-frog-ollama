import { i18n } from '#imports'
import { useAtom } from 'jotai'
import { ShortcutKeyRecorder } from '@/components/shortcut-key-recorder'
import { configFields } from '@/utils/atoms/config'
import { DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY } from '@/utils/constants/translate'
import { ConfigCard } from '../../components/config-card'

export function CustomAutoTranslateShortcutKey() {
  const [translateConfig, setTranslateConfig] = useAtom(configFields.translate)
  const shortcutKey = translateConfig.customAutoTranslateShortcutKey ?? DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY

  const updateShortcutKey = (shortcutKey: string[]) => {
    setTranslateConfig({
      ...translateConfig,
      customAutoTranslateShortcutKey: shortcutKey,
    })
  }

  return (
    <ConfigCard title={i18n.t('options.translation.customAutoTranslateShortcutKey.title')} description={i18n.t('options.translation.customAutoTranslateShortcutKey.description')}>
      <ShortcutKeyRecorder shortcutKey={shortcutKey} onChange={updateShortcutKey} />
    </ConfigCard>
  )
}
