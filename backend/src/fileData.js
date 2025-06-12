import fs from 'fs'

let filePath = null
export let documents = []
export let versions = []

export function init(path) {
  filePath = path
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    documents = JSON.parse(raw)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    documents = []
  }
}

function save() {
  if (!filePath) return
  fs.writeFileSync(filePath, JSON.stringify(documents, null, 2))
}

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
  save()
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
  save()
  return doc
}

export function deleteDocument(id) {
  const index = documents.findIndex(d => d.id === id)
  if (index === -1) return false
  versions.push({ ...documents[index], versionedAt: new Date().toISOString() })
  documents.splice(index, 1)
  save()
  return true
}

export function getDocumentVersions(id) {
  return versions.filter(v => v.id === id)
}
