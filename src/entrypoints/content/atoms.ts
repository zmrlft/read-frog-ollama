import { atom } from "jotai";
import { DEFAULT_SIDE_CONTENT_WIDTH } from "./constants";

export const isSideOpenAtom = atom(false);
export const sideContentWidthAtom = atom(DEFAULT_SIDE_CONTENT_WIDTH);
