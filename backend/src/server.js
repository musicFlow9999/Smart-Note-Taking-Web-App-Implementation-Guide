import http from 'http'
import { getAllDocuments, createDocument } from './data.js'

function jsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export function createApp() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/documents') {
      jsonResponse(res, 200, { documents: getAllDocuments() })
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
