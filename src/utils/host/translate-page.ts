import { translateWalkedNode, walkAndLabelDom } from "./dom";

export async function translatePage() {
  const id = crypto.randomUUID();

  walkAndLabelDom(document.body, id);
  if (document.body) {
    translateWalkedNode(document.body);
  }
}
