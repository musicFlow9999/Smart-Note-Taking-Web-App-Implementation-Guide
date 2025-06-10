export const documents = []

export function getAllDocuments() {
  return documents
}

export function createDocument({ title, content }) {
  const doc = { id: String(documents.length + 1), title, content }
  documents.push(doc)
  return doc
}

export function getDocumentById(id) {
  return documents.find(d => d.id === id)
}

export function updateDocument(id, { title, content }) {
  const doc = getDocumentById(id)
  if (!doc) return null
  if (title !== undefined) doc.title = title
  if (content !== undefined) doc.content = content
  return doc
}

export function deleteDocument(id) {
  const index = documents.findIndex(d => d.id === id)
  if (index === -1) return false
  documents.splice(index, 1)
  return true
}
