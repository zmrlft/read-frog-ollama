import { translateWalkedNode, walkAndLabelDom } from "./dom";

export async function translatePage() {
  const id = crypto.randomUUID();

  // // create a text node
  // const textNode = document.createTextNode("Original");
  // // create a span node
  // const spanNode = document.createElement("span");
  // // create a parent node
  // const parentNode = document.createElement("div");

  // // Add textNode to parent
  // parentNode.appendChild(textNode);

  // // Insert spanNode after textNode
  // if (textNode.parentNode) {
  //   console.log(textNode.parentNode);
  //   textNode.parentNode.insertBefore(spanNode, textNode.nextSibling);
  // }

  // console.log(parentNode);
  walkAndLabelDom(document.body, id);
  translateWalkedNode(document.body);
}
