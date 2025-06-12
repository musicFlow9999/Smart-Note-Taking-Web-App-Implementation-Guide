import crypto from 'crypto'

// Simple in-memory user store (in production, use a database)
const users = new Map()
const sessions = new Map()

export function hashPassword(password, salt = null) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

export function verifyPassword(password, hash, salt) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

export function createUser(username, password, email) {
  if (users.has(username)) {
    throw new Error('Username already exists')
  }
  
  const { hash, salt } = hashPassword(password)
  const user = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: new Date().toISOString()
  }
  
  users.set(username, user)
  return { id: user.id, username: user.username, email: user.email }
}

export function authenticateUser(username, password) {
  const user = users.get(username)
  if (!user) {
    throw new Error('User not found')
  }
  
  if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    throw new Error('Invalid password')
  }
  
  return { id: user.id, username: user.username, email: user.email }
}

export function createSession(userId) {
  const sessionId = crypto.randomUUID()
  const session = {
    id: sessionId,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  }
  
  sessions.set(sessionId, session)
  return sessionId
}

export function validateSession(sessionId) {
  const session = sessions.get(sessionId)
  if (!session) {
    return null
  }
  
  if (new Date() > new Date(session.expiresAt)) {
    sessions.delete(sessionId)
    return null
  }
  
  return session
}

export function destroySession(sessionId) {
  return sessions.delete(sessionId)
}

// Create a default admin user for testing
try {
  createUser('admin', 'admin123', 'admin@smartnotes.com')
  console.log('Default admin user created (username: admin, password: admin123)')
} catch (error) {
  // User already exists
}
