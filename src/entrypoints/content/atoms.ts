import { atom, createStore } from "jotai";
import { DEFAULT_SIDE_CONTENT_WIDTH } from "./constants";
import { atomWithMutation } from "jotai-tanstack-query";
import { mutationFn } from "@/hooks/read/explain";
import { toast } from "sonner";

export const store = createStore();

export const isSideOpenAtom = atom(false);
export const sideContentWidthAtom = atom(DEFAULT_SIDE_CONTENT_WIDTH);

export const progressAtom = atom({
  completed: 0,
  total: 0,
});

export const explainAtom = atomWithMutation(() => ({
  mutationKey: ["explainArticle"],
  mutationFn: mutationFn,
  onError: () => {
    toast.error("Failed to generate the explanation");
  },
}));

export const requestContinueAtom = atom(false);
