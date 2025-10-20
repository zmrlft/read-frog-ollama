import { atom, createStore } from 'jotai'

export const store = createStore()

export const isSideOpenAtom = atom(false)

export const isDraggingButtonAtom = atom(false)

export const progressAtom = atom({
  completed: 0,
  total: 0,
})

export const enablePageTranslationAtom = atom(false)

// export const explainAtom = atomWithMutation(() => ({
//   mutationKey: ["explainArticle"],
//   mutationFn: mutationFn,
// }));

export const readStateAtom = atom<
  'extracting' | 'analyzing' | 'continue?' | 'explaining' | undefined
>(undefined)
