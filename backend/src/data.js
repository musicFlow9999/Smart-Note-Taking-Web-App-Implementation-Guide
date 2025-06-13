export const notebooks = []
export const sectionGroups = []
export const sections = []
export const documents = []

export function getAllNotebooks() {
  return notebooks
}

export function createNotebook({ name }) {
  const nb = { id: String(notebooks.length + 1), name }
  notebooks.push(nb)
  return nb
}

export function getAllSectionGroups() {
  return sectionGroups
}

export function createSectionGroup({ notebookId, name }) {
  const sg = { id: String(sectionGroups.length + 1), notebookId, name }
  sectionGroups.push(sg)
  return sg
}

export function getAllSections() {
  return sections
}

export function createSection({ notebookId, sectionGroupId, name }) {
  const sec = {
    id: String(sections.length + 1),
    notebookId,
    sectionGroupId,
    name,
  }
  sections.push(sec)
  return sec
}

export function getAllDocuments() {
  return documents
}

export function createDocument({
  title,
  content,
  notebookId = null,
  sectionId = null,
}) {
  const doc = {
    id: String(documents.length + 1),
    title,
    content,
    notebookId,
    sectionId,
  }
  documents.push(doc)
  return doc
}

export function getDocumentById(id) {
  return documents.find(d => d.id === id)
}

export function updateDocument(id, { title, content, notebookId, sectionId }) {
  const doc = getDocumentById(id)
  if (!doc) return null
  if (title !== undefined) doc.title = title
  if (content !== undefined) doc.content = content
  if (notebookId !== undefined) doc.notebookId = notebookId
  if (sectionId !== undefined) doc.sectionId = sectionId
  return doc
}

export function deleteDocument(id) {
  const index = documents.findIndex(d => d.id === id)
  if (index === -1) return false
  documents.splice(index, 1)
  return true
}
