import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from './logger.js'

// ENVIRONMENT CONTEXT FOR AI ASSISTANTS  
// OS: Windows_NT | Shell: PowerShell | NOT Linux Container
// Database path uses Windows conventions when developing locally
// Deployed to Azure App Service Linux containers in production

// ES modules dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let SQL
let db
let dbPath

export async function init(dbFilePath) {
  dbPath = dbFilePath
  SQL = await initSqlJs()

  // Ensure the directory exists with robust error handling
  const dir = path.dirname(dbPath)
  logger.debug('Checking database directory', { dir, dbPath })
  
  try {
    if (!fs.existsSync(dir)) {
      logger.info('Creating database directory', { dir })
      fs.mkdirSync(dir, { recursive: true })
      logger.info('Database directory created successfully', { dir })
    } else {
      logger.debug('Database directory already exists', { dir })
    }
    
    // Verify directory is writable
    fs.accessSync(dir, fs.constants.W_OK)
    logger.debug('Database directory is writable', { dir })
    
  } catch (error) {
    logger.error('Failed to create or access database directory', { 
      dir, 
      error: error.message,
      code: error.code,
      stack: error.stack 
    })
    
    // Try alternative paths for Azure App Service
    if (process.env.NODE_ENV === 'production') {
      const altPaths = [
        '/tmp/data',
        path.join(process.cwd(), 'data'),
        path.join(__dirname, '..', '..', 'data')
      ]
      
      for (const altPath of altPaths) {
        try {
          logger.info('Trying alternative database path', { altPath })
          if (!fs.existsSync(altPath)) {
            fs.mkdirSync(altPath, { recursive: true })
          }
          fs.accessSync(altPath, fs.constants.W_OK)
          
          // Update dbPath to use the working alternative
          const altDbPath = path.join(altPath, path.basename(dbPath))
          logger.info('Using alternative database path', { original: dbPath, alternative: altDbPath })
          dbPath = altDbPath
          break
          
        } catch (altError) {
          logger.warn('Alternative path failed', { altPath, error: altError.message })
          continue
        }
      }
    } else {
      throw error
    }
  }

  // Try to load existing database
  try {
    const data = fs.readFileSync(dbPath)
    db = new SQL.Database(data)
    logger.info('Database loaded from file', { path: dbPath })
  } catch (err) {
    // Create new database if file doesn't exist
    db = new SQL.Database()
    logger.info('New database created', { path: dbPath })
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

  // Ensure user_id column exists for older databases
  let hasUserId = false
  const pragmaStmt = db.prepare('PRAGMA table_info(documents)')
  while (pragmaStmt.step()) {
    const row = pragmaStmt.getAsObject()
    if (row.name === 'user_id') {
      hasUserId = true
      break
    }
  }
  pragmaStmt.free()

  if (!hasUserId) {
    try {
      db.run('ALTER TABLE documents ADD COLUMN user_id TEXT')
      db.run("UPDATE documents SET user_id = 'legacy-user' WHERE user_id IS NULL")
      logger.info('Database migrated to add user_id column')
    } catch (error) {
      logger.error('Failed to add user_id column', { error: error.message })
    }
  }

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

  try {
    // Execute the INSERT statement
    db.run(
      `INSERT INTO documents (title, content, tags, created_at, updated_at, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, content, tagsJson, now, now, userId]
    )
    
    // Get the last insert rowid
    const stmt = db.prepare('SELECT last_insert_rowid() as id')
    stmt.step()
    const result = stmt.getAsObject()
    const id = String(result.id)
    stmt.free()

    const newDoc = {
      id,
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
  } catch (error) {
    logger.error('Failed to create document', { error: error.message })
    throw error
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

  try {
    db.run(
      `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`,
      values
    )
    saveDatabase()
    const updated = getDocumentById(id)
    logger.info('Document updated', { id, title: updated?.title })
    return updated
  } catch (error) {
    logger.error('Failed to update document', { error: error.message, id })
    throw error
  }
}

export function deleteDocument(id) {
  try {
    // Check if document exists first
    const stmt = db.prepare('SELECT COUNT(*) as count FROM documents WHERE id = ?')
    stmt.bind([parseInt(id)])
    stmt.step()
    const result = stmt.getAsObject()
    const exists = result.count > 0
    stmt.free()

    if (!exists) {
      return false
    }

    // Delete the document
    db.run('DELETE FROM documents WHERE id = ?', [parseInt(id)])
    saveDatabase()
    logger.info('Document deleted', { id })
    return true
  } catch (error) {
    logger.error('Failed to delete document', { error: error.message, id })
    return false
  }
}

// User management functions
export function createUser(userData) {
  const { id, username, email, passwordHash, passwordSalt } = userData
  
  try {
    db.run(
      `INSERT INTO users (id, username, email, password_hash, password_salt) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, username, email, passwordHash, passwordSalt]
    )
    saveDatabase()
    logger.info('User created in database', { userId: id, username })
    return { id, username, email }
  } catch (error) {
    logger.error('Failed to create user', { error: error.message, username })
    throw error
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
  try {
    db.run(
      `INSERT INTO refresh_tokens (token, user_id, expires_at) 
       VALUES (?, ?, ?)`,
      [token, userId, expiresAt]
    )
    saveDatabase()
    logger.info('Refresh token stored', { userId })
  } catch (error) {
    logger.error('Failed to store refresh token', { error: error.message, userId })
    throw error
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
  try {
    // Check if token exists first
    const stmt1 = db.prepare('SELECT COUNT(*) as count FROM refresh_tokens WHERE token = ?')
    stmt1.bind([token])
    stmt1.step()
    const result = stmt1.getAsObject()
    const exists = result.count > 0
    stmt1.free()

    if (!exists) {
      return false
    }

    // Delete the token
    db.run('DELETE FROM refresh_tokens WHERE token = ?', [token])
    saveDatabase()
    logger.info('Refresh token deleted')
    return true
  } catch (error) {
    logger.error('Failed to delete refresh token', { error: error.message })
    return false
  }
}
