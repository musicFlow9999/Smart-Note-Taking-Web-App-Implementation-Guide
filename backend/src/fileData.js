import fs from 'fs'

let filePath = null
export let notebooks = []
export let sectionGroups = []
export let sections = []
export let documents = []

export function init(path) {
  filePath = path
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    if (Array.isArray(data)) {
      documents = data
    } else {
      notebooks = data.notebooks || []
      sectionGroups = data.sectionGroups || []
      sections = data.sections || []
      documents = data.documents || []
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    notebooks = []
    sectionGroups = []
    sections = []
    documents = []
  }
}

function save() {
  if (!filePath) return
  const data = {
    notebooks,
    sectionGroups,
    sections,
    documents,
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export function getAllDocuments() {
  return documents
}

export function getAllNotebooks() {
  return notebooks
}

export function createNotebook({ name }) {
  const nb = { id: String(notebooks.length + 1), name }
  notebooks.push(nb)
  save()
  return nb
}

export function getAllSectionGroups() {
  return sectionGroups
}

export function createSectionGroup({ notebookId, name }) {
  const sg = { id: String(sectionGroups.length + 1), notebookId, name }
  sectionGroups.push(sg)
  save()
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
  save()
  return sec
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
  save()
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
  save()
  return doc
}

export function deleteDocument(id) {
  const index = documents.findIndex(d => d.id === id)
  if (index === -1) return false
  documents.splice(index, 1)
  save()
  return true
}
