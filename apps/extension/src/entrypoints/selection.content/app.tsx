import { NOTRANSLATE_CLASS } from '@/utils/constants/dom-labels'
import { cn } from '@/utils/tailwind'
import { SelectionTooltip } from './selection-tooltip'

export default function App() {
  return (
    <div className={cn('text-black dark:text-white', NOTRANSLATE_CLASS)}>
      <SelectionTooltip />
    </div>
  )
}
