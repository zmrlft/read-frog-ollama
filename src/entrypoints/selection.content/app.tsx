import { cn } from '@repo/ui/lib/utils'
import { Toaster } from 'sonner'
import { NOTRANSLATE_CLASS } from '@/utils/constants/dom-labels'
import { SelectionToolbar } from './selection-toolbar'

export default function App() {
  return (
    <div className={cn('text-black dark:text-white', NOTRANSLATE_CLASS)}>
      <SelectionToolbar />
      <Toaster richColors className="z-[2147483647] notranslate" />
    </div>
  )
}
