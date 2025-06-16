export function getOwnerDocument(node: Node): Document {
  return node.ownerDocument || document
}
