import Database from 'better-sqlite3'

let db

export function init(path) {
  db = new Database(path)
  db.prepare(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT
  )`).run()
}

export function getAllDocuments() {
  return db.prepare('SELECT id, title, content FROM documents').all()
}

export function createDocument({ title, content }) {
  const stmt = db.prepare('INSERT INTO documents (title, content) VALUES (?, ?)')
  const info = stmt.run(title, content)
  return { id: String(info.lastInsertRowid), title, content }
}

export function getDocumentById(id) {
  return db.prepare('SELECT id, title, content FROM documents WHERE id = ?').get(id)
}

export function updateDocument(id, { title, content }) {
  const existing = getDocumentById(id)
  if (!existing) return null
  const newTitle = title !== undefined ? title : existing.title
  const newContent = content !== undefined ? content : existing.content
  db.prepare('UPDATE documents SET title = ?, content = ? WHERE id = ?').run(newTitle, newContent, id)
  return { id: String(id), title: newTitle, content: newContent }
}

export function deleteDocument(id) {
  const result = db.prepare('DELETE FROM documents WHERE id = ?').run(id)
  return result.changes > 0
}
