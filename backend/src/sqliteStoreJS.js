import initSqlJs from 'sql.js'
import fs from 'fs'
import logger from './logger.js'

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
    logger.info('Database loaded from file', { path })
  } catch (err) {
    // Create new database if file doesn't exist
    db = new SQL.Database()
    logger.info('New database created', { path })
  }

  // Create tables if they don't exist
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS refresh_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`)

  // Create indexes for better performance
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)`
  )
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at)`
  )
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`
  )

  // Save to file
  saveDatabase()
}

function saveDatabase() {
  if (!db || !dbPath) return
  try {
    const data = db.export()
    fs.writeFileSync(dbPath, data)
  } catch (error) {
    logger.error('Failed to save database', {
      error: error.message,
      path: dbPath,
    })
  }
}

export function getAllDocuments(userId = null) {
  let query =
    'SELECT id, title, content, tags, created_at, updated_at, user_id FROM documents'
  let params = []

  if (userId) {
    query += ' WHERE user_id = ? OR user_id IS NULL'
    params = [userId]
  }

  query += ' ORDER BY updated_at DESC'

  const stmt = db.prepare(query)
  const results = []

  if (params.length > 0) {
    stmt.bind(params)
  }

  while (stmt.step()) {
    const row = stmt.getAsObject()
    results.push({
      id: String(row.id),
      title: row.title,
      content: row.content,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id,
    })
  }
  stmt.free()
  return results
}

export function createDocument(data) {
  const { title, content, tags = [], userId = null } = data
  const tagsJson = JSON.stringify(tags)
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO documents (title, content, tags, created_at, updated_at, user_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  try {
    const info = stmt.run([title, content, tagsJson, now, now, userId])
    const newDoc = {
      id: String(info.lastInsertRowid),
      title,
      content,
      tags,
      createdAt: now,
      updatedAt: now,
      userId,
    }
    saveDatabase()
    logger.info('Document created', { id: newDoc.id, title, userId })
    return newDoc
  } finally {
    stmt.free()
  }
}

export function getDocumentById(id) {
  const stmt = db.prepare(`
    SELECT id, title, content, tags, created_at, updated_at, user_id 
    FROM documents WHERE id = ?
  `)

  try {
    stmt.bind([parseInt(id)])
    if (stmt.step()) {
      const row = stmt.getAsObject()
      return {
        id: String(row.id),
        title: row.title,
        content: row.content,
        tags: JSON.parse(row.tags || '[]'),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        userId: row.user_id,
      }
    }
    return null
  } finally {
    stmt.free()
  }
}

export function updateDocument(id, data) {
  const current = getDocumentById(id)
  if (!current) return null

  const updates = []
  const values = []

  if (data.title !== undefined) {
    updates.push('title = ?')
    values.push(data.title)
  }
  if (data.content !== undefined) {
    updates.push('content = ?')
    values.push(data.content)
  }
  if (data.tags !== undefined) {
    updates.push('tags = ?')
    values.push(JSON.stringify(data.tags))
  }

  updates.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(parseInt(id))

  const stmt = db.prepare(`
    UPDATE documents SET ${updates.join(', ')} WHERE id = ?
  `)

  try {
    stmt.run(values)
    saveDatabase()
    const updated = getDocumentById(id)
    logger.info('Document updated', { id, title: updated.title })
    return updated
  } finally {
    stmt.free()
  }
}

export function deleteDocument(id) {
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?')

  try {
    const info = stmt.run([parseInt(id)])
    saveDatabase()
    const deleted = info.changes > 0
    if (deleted) {
      logger.info('Document deleted', { id })
    }
    return deleted
  } finally {
    stmt.free()
  }
}

// User management functions
export function createUser(userData) {
  const { id, username, email, passwordHash, passwordSalt } = userData
  const stmt = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, password_salt) 
    VALUES (?, ?, ?, ?, ?)
  `)

  try {
    stmt.run([id, username, email, passwordHash, passwordSalt])
    saveDatabase()
    logger.info('User created in database', { userId: id, username })
    return { id, username, email }
  } finally {
    stmt.free()
  }
}

export function getUserByUsername(username) {
  const stmt = db.prepare(`
    SELECT id, username, email, password_hash, password_salt, created_at 
    FROM users WHERE username = ?
  `)

  try {
    stmt.bind([username])
    if (stmt.step()) {
      const row = stmt.getAsObject()
      return {
        id: row.id,
        username: row.username,
        email: row.email,
        passwordHash: row.password_hash,
        passwordSalt: row.password_salt,
        createdAt: row.created_at,
      }
    }
    return null
  } finally {
    stmt.free()
  }
}

export function storeRefreshToken(token, userId, expiresAt) {
  const stmt = db.prepare(`
    INSERT INTO refresh_tokens (token, user_id, expires_at) 
    VALUES (?, ?, ?)
  `)

  try {
    stmt.run([token, userId, expiresAt])
    saveDatabase()
  } finally {
    stmt.free()
  }
}

export function getRefreshToken(token) {
  const stmt = db.prepare(`
    SELECT token, user_id, created_at, expires_at 
    FROM refresh_tokens WHERE token = ?
  `)

  try {
    stmt.bind([token])
    if (stmt.step()) {
      const row = stmt.getAsObject()
      return {
        token: row.token,
        userId: row.user_id,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
      }
    }
    return null
  } finally {
    stmt.free()
  }
}

export function deleteRefreshToken(token) {
  const stmt = db.prepare('DELETE FROM refresh_tokens WHERE token = ?')

  try {
    const info = stmt.run([token])
    saveDatabase()
    return info.changes > 0
  } finally {
    stmt.free()
  }
}
