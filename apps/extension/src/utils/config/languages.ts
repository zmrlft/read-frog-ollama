import type { LangCodeISO6393 } from '@repo/definitions/src/types/languages'

export function getFinalSourceCode(sourceCode: LangCodeISO6393 | 'auto', detectedCode: LangCodeISO6393): LangCodeISO6393 {
  return sourceCode === 'auto' ? detectedCode : sourceCode
}
