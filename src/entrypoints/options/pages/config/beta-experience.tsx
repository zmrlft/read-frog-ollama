import { i18n } from '#imports'
import { Switch } from '@repo/ui/components/switch'
import { useAtom } from 'jotai'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { ConfigCard } from '../../components/config-card'

export function BetaExperienceConfig() {
  const [betaExperienceConfig, setBetaExperienceConfig] = useAtom(configFieldsAtomMap.betaExperience)

  return (
    <ConfigCard
      title={i18n.t('options.betaExperience.title')}
      description={i18n.t('options.betaExperience.description')}
    >
      <div className="w-full flex justify-end">
        <Switch
          checked={betaExperienceConfig.enabled}
          onCheckedChange={(checked) => {
            void setBetaExperienceConfig({
              enabled: checked,
            })
          }}
        />
      </div>
    </ConfigCard>
  )
}
