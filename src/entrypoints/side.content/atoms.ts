import { atom, createStore } from "jotai";

export const store = createStore();

export const isSideOpenAtom = atom(false);

export const progressAtom = atom({
  completed: 0,
  total: 0,
});

// export const explainAtom = atomWithMutation(() => ({
//   mutationKey: ["explainArticle"],
//   mutationFn: mutationFn,
// }));

export const readStateAtom = atom<
  "analyzing" | "continue?" | "explaining" | undefined
>(undefined);

export const showPageTranslationAtom = atom<boolean>(
  sessionStorage.getItem("showPageTranslation") === "true",
);

export const showPageTranslationAtomPersistence = atom(
  (get) => get(showPageTranslationAtom),
  (_get, set, newValue: boolean) => {
    set(showPageTranslationAtom, newValue);
    const newValueStr = newValue ? "true" : "false";
    sessionStorage.setItem("showPageTranslation", newValueStr);
  },
);
