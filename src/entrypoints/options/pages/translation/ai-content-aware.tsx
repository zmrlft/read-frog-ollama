import { i18n } from '#imports'
import { deepmerge } from 'deepmerge-ts'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { Badge } from '@/components/shadcn/badge'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/shadcn/field'
import { Switch } from '@/components/shadcn/switch'
import { isLLMTranslateProviderConfig } from '@/types/config/provider'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { getProviderConfigById } from '@/utils/config/helpers'
import { ConfigCard } from '../../components/config-card'
import { LLMStatusIndicator } from '../../components/llm-status-indicator'

export function AIContentAware() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const [providersConfig] = useAtom(configFieldsAtomMap.providersConfig)

  const hasLLMProvider = useMemo(() => {
    const providerConfig = getProviderConfigById(providersConfig, translateConfig.providerId)
    return providerConfig ? isLLMTranslateProviderConfig(providerConfig) : false
  }, [providersConfig, translateConfig.providerId])

  return (
    <ConfigCard
      title={(
        <>
          {i18n.t('options.translation.aiContentAware.title')}
          {' '}
          <Badge variant="secondary" className="align-middle">Public Beta</Badge>
        </>
      )}
      description={(
        <>
          {i18n.t('options.translation.aiContentAware.description')}
          <LLMStatusIndicator hasLLMProvider={hasLLMProvider} />
        </>
      )}
    >
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="ai-content-aware-toggle">
            {i18n.t('options.translation.aiContentAware.enable')}
          </FieldLabel>
          <FieldDescription>
            {i18n.t('options.translation.aiContentAware.enableDescription')}
          </FieldDescription>
        </FieldContent>
        <Switch
          id="ai-content-aware-toggle"
          checked={translateConfig.enableAIContentAware}
          onCheckedChange={(checked) => {
            void setTranslateConfig(
              deepmerge(translateConfig, {
                enableAIContentAware: checked,
              }),
            )
          }}
        />
      </Field>
    </ConfigCard>
  )
}
