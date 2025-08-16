import { i18n } from '#imports'
import { useAtomValue, useSetAtom } from 'jotai'

import { toast } from 'sonner'
import { useExtractContent } from '@/hooks/read/extract'
import { useReadArticle } from '@/hooks/read/read'
import { configFields } from '@/utils/atoms/config'

import { isAnyAPIKey } from '@/utils/config/config'
import { isDraggingButtonAtom, isSideOpenAtom } from '../../atoms'
import HiddenButton from './components/hidden-button'

export default function FloatingReadButton() {
  const providersConfig = useAtomValue(configFields.providersConfig)
  const setIsSideOpen = useSetAtom(isSideOpenAtom)
  const {
    mutate: readArticle,
    analyzeContent,
    explainArticle,
  } = useReadArticle()
  const { isPending: isExtractingContent, data: extractedContent } = useExtractContent()
  const isDraggingButton = useAtomValue(isDraggingButtonAtom)

  const startReadArticle = () => {
    if (!isAnyAPIKey(providersConfig)) {
      toast.error(i18n.t('noAPIKeyConfig.warning'))
      return
    }

    setIsSideOpen(true)
    if (isExtractingContent) {
      toast.warning('Waiting content to be extracted...')
      return
    }
    if (!isExtractingContent && !extractedContent) {
      toast.error('Failed to extract content')
      return
    }
    if (analyzeContent.isPending || explainArticle.isPending) {
      toast.warning('Reading in progress...')
      return
    }
    readArticle()
  }

  return <HiddenButton icon="tabler:book" onClick={startReadArticle} className={(isDraggingButton ? 'translate-x-0' : '')} />
}
