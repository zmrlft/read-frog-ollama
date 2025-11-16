import type { LangCodeISO6393 } from '@read-frog/definitions'

export function getFinalSourceCode(sourceCode: LangCodeISO6393 | 'auto', detectedCode: LangCodeISO6393): LangCodeISO6393 {
  return sourceCode === 'auto' ? detectedCode : sourceCode
}
