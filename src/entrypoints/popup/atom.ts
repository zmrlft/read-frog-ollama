import { atom } from "jotai";

const checkEmptyTab = async () => {
  if (typeof window !== "undefined" && browser.tabs) {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];
    return (
      currentTab?.url === "about:blank" ||
      currentTab?.url === "chrome://newtab/" ||
      currentTab?.url === "edge://newtab/" ||
      currentTab?.url?.startsWith("about:newtab") ||
      false
    );
  }
  return false;
};

export const isEmptyTabAtom = atom<boolean>(false);

// Create a derived atom for initialization
export const initEmptyTabAtom = atom(null, async (get, set) => {
  const isEmpty = await checkEmptyTab();
  set(isEmptyTabAtom, isEmpty);
});
