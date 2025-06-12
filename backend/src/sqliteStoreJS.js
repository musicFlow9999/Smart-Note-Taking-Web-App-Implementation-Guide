import initSqlJs from 'sql.js'
import fs from 'fs'

let SQL
let db
let dbPath

export async function init(path) {
  dbPath = path
  SQL = await initSqlJs()
  
  // Try to load existing database
  try {
    const data = fs.readFileSync(dbPath)
    db = new SQL.Database(data)
  } catch (err) {
    // Create new database if file doesn't exist
    db = new SQL.Database()
  }
  
  // Create table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT
  )`)
  
  // Save to file
  saveDatabase()
}

function saveDatabase() {
  if (!db || !dbPath) return
  const data = db.export()
  fs.writeFileSync(dbPath, data)
}

export function getAllDocuments() {
  const stmt = db.prepare('SELECT id, title, content FROM documents')
  const results = []
  while (stmt.step()) {
    const row = stmt.getAsObject()
    results.push({
      id: String(row.id),
      title: row.title,
      content: row.content
    })
  }
  stmt.free()
  return results
}

export function createDocument({ title, content }) {
  const stmt = db.prepare('INSERT INTO documents (title, content) VALUES (?, ?)')
  stmt.run([title, content])
  const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0]
  stmt.free()
  saveDatabase()
  return { id: String(id), title, content }
}

export function getDocumentById(id) {
  const stmt = db.prepare('SELECT id, title, content FROM documents WHERE id = ?')
  stmt.bind([id])
  if (stmt.step()) {
    const row = stmt.getAsObject()
    stmt.free()
    return {
      id: String(row.id),
      title: row.title,
      content: row.content
    }
  }
  stmt.free()
  return null
}

export function updateDocument(id, { title, content }) {
  const existing = getDocumentById(id)
  if (!existing) return null
  
  const newTitle = title !== undefined ? title : existing.title
  const newContent = content !== undefined ? content : existing.content
  
  const stmt = db.prepare('UPDATE documents SET title = ?, content = ? WHERE id = ?')
  stmt.run([newTitle, newContent, id])
  stmt.free()
  saveDatabase()
  
  return { id: String(id), title: newTitle, content: newContent }
}

export function deleteDocument(id) {
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?')
  stmt.run([id])
  const changes = db.getRowsModified()
  stmt.free()
  saveDatabase()
  return changes > 0
}
