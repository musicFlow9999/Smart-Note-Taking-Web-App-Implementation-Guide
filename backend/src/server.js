import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'
import http from 'http'
import url from 'url'
import logger from './logger.js'

// Configure dotenv to load from backend/.env
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })
import {
  getAllDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from './store.js'
import {
  createUser,
  authenticateUser,
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
  verifyToken,
} from './auth.js'

const requests = new Map()

function setCorsHeaders(res) {
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000'
  
  // For development, also allow file:// protocol requests
  if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', '*')
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  }
  
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

function jsonResponse(res, statusCode, data) {
  setCorsHeaders(res)
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const MAX_SIZE = 1_000_000 // 1MB
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > MAX_SIZE) {
        reject(new Error('Payload too large'))
        req.connection.destroy()
      }
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

export function createApp() {
  return http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true)
    const pathname = parsedUrl.pathname
    const query = parsedUrl.query

    // simple rate limiting: 100 requests per 15 minutes per IP
    const ip = req.socket.remoteAddress
    const now = Date.now()
    const info = requests.get(ip) || { count: 0, start: now }
    if (now - info.start > 15 * 60 * 1000) {
      info.count = 0
      info.start = now
    }
    info.count += 1
    requests.set(ip, info)
    if (info.count > 100) {
      setCorsHeaders(res)
      res.writeHead(429, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Too many requests' }))
      return
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      setCorsHeaders(res)
      res.writeHead(200)
      res.end()
      return
    }

    // Log incoming requests
    logger.info('Request received', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
    })

    try {
      // Auth endpoints
      if (req.method === 'POST' && pathname === '/api/auth/register') {
        const { username, password, email } = await parseJsonBody(req)

        if (!username || !password || !email) {
          return jsonResponse(res, 400, {
            error: 'Username, password, and email are required',
          })
        }

        try {
          const user = createUser(username, password, email)
          const tokens = generateTokens(user)
          jsonResponse(res, 201, {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          })
        } catch (error) {
          logger.warn('Registration failed', { username, error: error.message })
          jsonResponse(res, 400, { error: error.message })
        }
        return
      }

      if (req.method === 'POST' && pathname === '/api/auth/login') {
        const { username, password } = await parseJsonBody(req)

        if (!username || !password) {
          return jsonResponse(res, 400, {
            error: 'Username and password are required',
          })
        }

        try {
          const user = authenticateUser(username, password)
          const tokens = generateTokens(user)
          jsonResponse(res, 200, {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          })
        } catch (error) {
          logger.warn('Login failed', { username, error: error.message })
          jsonResponse(res, 401, { error: 'Invalid credentials' })
        }
        return
      }

      if (req.method === 'POST' && pathname === '/api/auth/refresh') {
        const { refreshToken } = await parseJsonBody(req)

        if (!refreshToken) {
          return jsonResponse(res, 400, { error: 'Refresh token required' })
        }

        try {
          const newAccessToken = refreshAccessToken(refreshToken)
          jsonResponse(res, 200, { accessToken: newAccessToken })
        } catch (error) {
          logger.warn('Token refresh failed', { error: error.message })
          jsonResponse(res, 401, { error: error.message })
        }
        return
      }

      if (req.method === 'POST' && pathname === '/api/auth/logout') {
        const { refreshToken } = await parseJsonBody(req)

        if (refreshToken) {
          revokeRefreshToken(refreshToken)
        }

        jsonResponse(res, 200, { message: 'Logged out successfully' })
        return
      }

      if (req.method === 'GET' && pathname === '/api/auth/me') {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return jsonResponse(res, 401, { error: 'No token provided' })
        }

        const token = authHeader.substring(7)
        const decoded = verifyToken(token)

        if (!decoded) {
          return jsonResponse(res, 401, { error: 'Invalid token' })
        }

        jsonResponse(res, 200, {
          user: {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
          },
        })
        return
      }

      // Document endpoints - now with authentication
      const idMatch = pathname.match(/^\/api\/documents\/(\w+)$/)

      if (req.method === 'GET' && pathname === '/api/documents') {
        // For now, make documents public, but you can add auth here
        const docs = await getAllDocuments()
        const searchTerm = query.search
        const tag = query.tag

        let filteredDocs = docs

        if (searchTerm) {
          filteredDocs = docs.filter(
            doc =>
              doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              doc.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }

        if (tag) {
          filteredDocs = filteredDocs.filter(
            doc => doc.tags && doc.tags.includes(tag)
          )
        }

        jsonResponse(res, 200, { documents: filteredDocs })
        return
      }

      if (req.method === 'GET' && idMatch) {
        const doc = await getDocumentById(idMatch[1])
        if (doc) {
          jsonResponse(res, 200, doc)
        } else {
          jsonResponse(res, 404, { error: 'Not found' })
        }
        return
      }      if (req.method === 'POST' && pathname === '/api/documents') {
        try {
          const { title, content, tags } = await parseJsonBody(req)

          if (!title || !content) {
            return jsonResponse(res, 400, {
              error: 'Title and content are required',
            })
          }

          // TODO: Extract userId from JWT authentication when auth is implemented
          // For now, use a default userId for testing
          const userId = 'default-user-id'

          const doc = await createDocument({
            title,
            content,
            tags: tags || [],
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          jsonResponse(res, 201, doc)
        } catch (error) {
          if (error.message === 'Invalid JSON') {
            jsonResponse(res, 400, { error: 'Invalid JSON' })
          } else if (error.message === 'Payload too large') {
            jsonResponse(res, 413, { error: 'Payload too large' })
          } else {
            throw error
          }
        }
        return
      }

      if ((req.method === 'PUT' || req.method === 'PATCH') && idMatch) {
        try {
          const data = await parseJsonBody(req)
          data.updatedAt = new Date().toISOString()

          const updated = await updateDocument(idMatch[1], data)
          if (updated) {
            jsonResponse(res, 200, updated)
          } else {
            jsonResponse(res, 404, { error: 'Not found' })
          }
        } catch (error) {
          if (error.message === 'Invalid JSON') {
            jsonResponse(res, 400, { error: 'Invalid JSON' })
          } else if (error.message === 'Payload too large') {
            jsonResponse(res, 413, { error: 'Payload too large' })
          } else {
            throw error
          }
        }
        return
      }

      if (req.method === 'DELETE' && idMatch) {
        const ok = await deleteDocument(idMatch[1])
        if (ok) {
          jsonResponse(res, 204, null)
        } else {
          jsonResponse(res, 404, { error: 'Not found' })
        }
        return
      }

      // Health check endpoint
      if (req.method === 'GET' && pathname === '/api/health') {
        jsonResponse(res, 200, {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',        })
        return
      }

      // Static file serving for frontend
      if (!pathname.startsWith('/api/')) {
        try {
          let filePath = pathname
          
          // Default to index.html for root and other routes (SPA routing)
          if (pathname === '/' || !pathname.includes('.')) {
            filePath = '/index.html'
          }
          
          const staticFilePath = join(__dirname, '../public', filePath)
          
          if (existsSync(staticFilePath)) {
            const content = readFileSync(staticFilePath)
            const ext = filePath.split('.').pop()
            
            // Set content type based on file extension
            let contentType = 'text/html'
            switch (ext) {
              case 'js':
                contentType = 'application/javascript'
                break
              case 'css':
                contentType = 'text/css'
                break
              case 'json':
                contentType = 'application/json'
                break
              case 'png':
                contentType = 'image/png'
                break
              case 'jpg':
              case 'jpeg':
                contentType = 'image/jpeg'
                break
              case 'svg':
                contentType = 'image/svg+xml'
                break
              case 'ico':
                contentType = 'image/x-icon'
                break
            }
            
            setCorsHeaders(res)
            res.writeHead(200, { 'Content-Type': contentType })
            res.end(content)
            return
          }
        } catch (error) {
          logger.error('Error serving static file', { 
            error: error.message, 
            pathname 
          })
        }
      }

      // 404 for unmatched routes
      jsonResponse(res, 404, { error: 'Endpoint not found' })
    } catch (error) {
      logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
      })
      jsonResponse(res, 500, { error: 'Internal server error' })
    }
  })
}

// Check if this module is being run directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const PORT = process.env.PORT || 5000
  const server = createApp()

  server.listen(PORT, () => {
    logger.info('Server started', {
      port: PORT,
      env: process.env.NODE_ENV || 'development',
      pid: process.pid,
    })
    console.log(`🚀 Smart Notes API running on port ${PORT}`)
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully')
    server.close(() => {
      logger.info('Server closed')
      process.exit(0)
    })
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully')
    server.close(() => {
      logger.info('Server closed')
      process.exit(0)
    })
  })
}
