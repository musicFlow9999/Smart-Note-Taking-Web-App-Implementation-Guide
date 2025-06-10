export const documents = []

export function getAllDocuments() {
  return documents
}

export function createDocument({ title, content }) {
  const doc = { id: String(documents.length + 1), title, content }
  documents.push(doc)
  return doc
}
