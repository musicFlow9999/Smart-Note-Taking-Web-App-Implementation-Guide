import http from 'http'
import {
  getAllDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument
} from './data.js'

function jsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export function createApp() {
  return http.createServer((req, res) => {
    const idMatch = req.url.match(/^\/api\/documents\/(\w+)$/)

    if (req.method === 'GET' && req.url === '/api/documents') {
      jsonResponse(res, 200, { documents: getAllDocuments() })
    } else if (req.method === 'GET' && idMatch) {
      const doc = getDocumentById(idMatch[1])
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
      req.on('end', () => {
        try {
          const { title, content } = JSON.parse(body)
          const doc = createDocument({ title, content })
          jsonResponse(res, 201, doc)
        } catch (err) {
          jsonResponse(res, 400, { error: 'Invalid JSON' })
        }
      })
    } else if ((req.method === 'PUT' || req.method === 'PATCH') && idMatch) {
      let body = ''
      req.on('data', c => { body += c })
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          const updated = updateDocument(idMatch[1], data)
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
      const ok = deleteDocument(idMatch[1])
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
