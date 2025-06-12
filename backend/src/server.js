import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getAllDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument
} from './store.js'
import {
  createUser,
  authenticateUser,
  createSession,
  validateSession,
  destroySession
} from './auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function jsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function serveStaticFile(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('File not found')
  }
}

export function createApp() {
  return http.createServer(async (req, res) => {
    const idMatch = req.url.match(/^\/api\/documents\/(\w+)$/)    // Serve frontend
    if (req.method === 'GET' && req.url === '/') {
      const frontendPath = path.join(__dirname, '../../frontend/index.html')
      serveStaticFile(res, frontendPath, 'text/html')
    }
    // Authentication endpoints
    else if (req.method === 'POST' && req.url === '/api/auth/register') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const { username, password, email } = JSON.parse(body)
          const user = createUser(username, password, email)
          jsonResponse(res, 201, { user })
        } catch (error) {
          jsonResponse(res, 400, { error: error.message })
        }
      })
    }
    else if (req.method === 'POST' && req.url === '/api/auth/login') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const { username, password } = JSON.parse(body)
          const user = authenticateUser(username, password)
          const sessionId = createSession(user.id)
          
          res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`)
          jsonResponse(res, 200, { user, sessionId })
        } catch (error) {
          jsonResponse(res, 401, { error: error.message })
        }
      })
    }
    else if (req.method === 'POST' && req.url === '/api/auth/logout') {
      const cookies = req.headers.cookie || ''
      const sessionMatch = cookies.match(/sessionId=([^;]+)/)
      
      if (sessionMatch) {
        destroySession(sessionMatch[1])
      }
      
      res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Max-Age=0')
      jsonResponse(res, 200, { message: 'Logged out successfully' })
    }
    // Document API endpoints
    else if (req.method === 'GET' && req.url === '/api/documents') {
      const docs = await getAllDocuments()
      jsonResponse(res, 200, { documents: docs })
    } else if (req.method === 'GET' && idMatch) {
      const doc = await getDocumentById(idMatch[1])
      if (doc) {
        jsonResponse(res, 200, doc)
      } else {
        jsonResponse(res, 404, { error: 'Not found' })
      }
    } else if (req.method === 'POST' && req.url === '/api/documents') {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })
      req.on('end', async () => {
        try {
          const { title, content } = JSON.parse(body)
          const doc = await createDocument({ title, content })
          jsonResponse(res, 201, doc)
        } catch (err) {
          jsonResponse(res, 400, { error: 'Invalid JSON' })
        }
      })
    } else if ((req.method === 'PUT' || req.method === 'PATCH') && idMatch) {
      let body = ''
      req.on('data', c => { body += c })
      req.on('end', async () => {
        try {
          const data = JSON.parse(body)
          const updated = await updateDocument(idMatch[1], data)
          if (updated) {
            jsonResponse(res, 200, updated)
          } else {
            jsonResponse(res, 404, { error: 'Not found' })
          }
        } catch {
          jsonResponse(res, 400, { error: 'Invalid JSON' })
        }
      })
    } else if (req.method === 'DELETE' && idMatch) {
      const ok = await deleteDocument(idMatch[1])
      if (ok) {
        jsonResponse(res, 204, null)
      } else {
        jsonResponse(res, 404, { error: 'Not found' })
      }
    } else {
      jsonResponse(res, 404, { error: 'Not found' })
    }
  })
}

// Check if this module is being run directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const PORT = process.env.PORT || 5000
  createApp().listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}
