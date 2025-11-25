import type { ExtractedContent } from '@/types/content'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { getDocumentInfo } from '@/utils/content/analyze'
import { logger } from '@/utils/logger'

export function useExtractContent() {
  const setLanguage = useSetAtom(configFieldsAtomMap.language)

  return useQuery<ExtractedContent | null>({
    queryKey: ['extractContent'],
    queryFn: async () => {
      try {
        // TODO: in analyzing, we should re-extract the article in case it changed, and reset the lang
        const { detectedCodeOrUnd, paragraphs, article } = await getDocumentInfo()

        logger.log('detected lang', detectedCodeOrUnd)

        void setLanguage({ detectedCode: detectedCodeOrUnd === 'und' ? 'eng' : detectedCodeOrUnd })

        return {
          article: {
            ...article,
            lang: detectedCodeOrUnd,
          },
          paragraphs,
        }
      }
      catch (error) {
        logger.error('Failed to extract content from document:', error)
        return null
      }
    },
  })
}
