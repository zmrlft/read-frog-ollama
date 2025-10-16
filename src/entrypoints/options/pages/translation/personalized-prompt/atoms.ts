import { atom } from 'jotai'

/**
 * Atom to manage export mode state
 * When true, the prompt list is in export/selection mode
 */
export const isExportPromptModeAtom = atom(false)

/**
 * Atom to manage selected prompts for export
 */
export const selectedPromptsToExportAtom = atom<string[]>([])
