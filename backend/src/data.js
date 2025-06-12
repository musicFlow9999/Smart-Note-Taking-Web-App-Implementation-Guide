export const documents = []
export const versions = []

export function getAllDocuments(userId = null) {
  if (!userId) return documents
  return documents.filter(d => d.userId === userId)
}

export function createDocument({ title, content, tags = [], userId = null }) {
  const doc = {
    id: String(documents.length + 1),
    title,
    content,
    tags,
    userId,
  }
  documents.push(doc)
  return doc
}

export function getDocumentById(id) {
  return documents.find(d => d.id === id)
}

export function updateDocument(id, { title, content, tags }) {
  const doc = getDocumentById(id)
  if (!doc) return null
  versions.push({ ...doc, versionedAt: new Date().toISOString() })
  if (title !== undefined) doc.title = title
  if (content !== undefined) doc.content = content
  if (tags !== undefined) doc.tags = tags
  return doc
}

export function deleteDocument(id) {
  const index = documents.findIndex(d => d.id === id)
  if (index === -1) return false
  versions.push({ ...documents[index], versionedAt: new Date().toISOString() })
  documents.splice(index, 1)
  return true
}

export function getDocumentVersions(id) {
  return versions.filter(v => v.id === id)
}
