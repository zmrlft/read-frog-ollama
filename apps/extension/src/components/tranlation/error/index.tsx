import type { TransNode } from '@/types/dom'
import { ErrorButton } from './error-button'
import { RetryButton } from './retry-button'

export function TranslationError({ nodes, error }: { nodes: TransNode[], error: Error }) {
  return (
    <div className="notranslate inline-flex items-center justify-center gap-1 px-1.5">
      <RetryButton nodes={nodes} />
      <ErrorButton error={error} />
    </div>
  )
}
