import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import logger from './logger.js'

// Configure dotenv to load from backend/.env
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })

// JWT configuration
let JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  // Generate a random secret if none provided, but warn that it's temporary
  JWT_SECRET = crypto.randomBytes(32).toString('hex')
  logger.warn(
    'JWT_SECRET not set. Generated temporary secret; sessions will be invalid on restart'
  )
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

// Simple in-memory user store (will be moved to database)
const users = new Map()
const refreshTokens = new Map()

export function hashPassword(password, salt = null) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex')
  return { hash, salt }
}

export function verifyPassword(password, hash, salt) {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex')
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
    createdAt: new Date().toISOString(),
  }

  users.set(username, user)
  logger.info('User created', { userId: user.id, username })
  return { id: user.id, username: user.username, email: user.email }
}

export function authenticateUser(username, password) {
  const user = users.get(username)
  if (!user) {
    logger.warn('Authentication attempt for non-existent user', { username })
    throw new Error('Invalid credentials')
  }

  if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    logger.warn('Invalid password attempt', { username, userId: user.id })
    throw new Error('Invalid credentials')
  }

  logger.info('User authenticated successfully', { userId: user.id, username })
  return { id: user.id, username: user.username, email: user.email }
}

export function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  const refreshToken = jwt.sign({ id: user.id, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })

  // Store refresh token
  refreshTokens.set(refreshToken, {
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  return { accessToken, refreshToken }
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    logger.warn('Token verification failed', { error: error.message })
    return null
  }
}

export function refreshAccessToken(refreshToken) {
  const tokenData = refreshTokens.get(refreshToken)
  if (!tokenData) {
    throw new Error('Invalid refresh token')
  }

  if (new Date() > new Date(tokenData.expiresAt)) {
    refreshTokens.delete(refreshToken)
    throw new Error('Refresh token expired')
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET)
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type')
    }

    const user = Array.from(users.values()).find(u => u.id === decoded.id)
    if (!user) {
      throw new Error('User not found')
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return newAccessToken
  } catch (error) {
    logger.warn('Refresh token verification failed', { error: error.message })
    throw new Error('Invalid refresh token')
  }
}

export function revokeRefreshToken(refreshToken) {
  return refreshTokens.delete(refreshToken)
}

// Legacy session functions for backward compatibility
export function createSession(userId) {
  const user = Array.from(users.values()).find(u => u.id === userId)
  if (!user) return null

  const tokens = generateTokens(user)
  return tokens.accessToken
}

export function validateSession(sessionId) {
  const decoded = verifyToken(sessionId)
  return decoded ? { userId: decoded.id } : null
}

export function destroySession(_sessionId) { // eslint-disable-line no-unused-vars
  // For JWT tokens, we can't really "destroy" them without a blacklist
  // In production, you'd implement a token blacklist
  return true
}

// Middleware function for authentication
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .writeHead(401, { 'Content-Type': 'application/json' })
      .end(JSON.stringify({ error: 'No token provided' }))
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    return res
      .writeHead(401, { 'Content-Type': 'application/json' })
      .end(JSON.stringify({ error: 'Invalid token' }))
  }

  req.user = decoded
  next()
}

// In production, create users through registration endpoint or admin interface
