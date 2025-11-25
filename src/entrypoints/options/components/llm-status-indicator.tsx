import { i18n } from '#imports'

interface LLMStatusIndicatorProps {
  hasLLMProvider: boolean
}

export function LLMStatusIndicator({ hasLLMProvider }: LLMStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className={`size-2 rounded-full ${hasLLMProvider ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className="text-xs">
        {hasLLMProvider
          ? i18n.t('options.translation.llmProviderConfigured')
          : i18n.t('options.translation.llmProviderNotConfigured')}
      </span>
    </div>
  )
}
