import { atom } from "jotai";
import { DEFAULT_SIDE_CONTENT_WIDTH } from "./constants";
import { atomWithMutation } from "jotai-tanstack-query";
import { mutationFn } from "@/hooks/read/explain";
import { toast } from "sonner";

export const isSideOpenAtom = atom(false);
export const sideContentWidthAtom = atom(DEFAULT_SIDE_CONTENT_WIDTH);

export const explainAtom = atomWithMutation(() => ({
  mutationKey: ["explainArticle"],
  mutationFn: mutationFn,
  onError: () => {
    toast.error("Failed to generate the explanation");
  },
}));

export const requestContinueAtom = atom(false);
