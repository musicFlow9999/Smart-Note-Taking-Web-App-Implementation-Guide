import { createApp } from '../src/server.js'
import { once } from 'events'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { resetStore } from '../src/store.js'

let token = null

async function auth(server) {
  const res = await makeRequest(server, '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'user' + Date.now(),
      email: `u${Date.now()}@example.com`,
      password: 'pass1234',
    }),
  })
  const data = await res.json()
  token = data.accessToken
}

// Test utilities
async function makeRequest(server, endpoint, options = {}) {
  const { port } = server.address()
  const url = `http://localhost:${port}${endpoint}`
  const opts = { ...options }
  opts.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  }
  return await fetch(url, opts)
}

async function createTestDocument(
  server,
  title = 'Test Doc',
  content = 'Test Content'
) {
  const res = await makeRequest(server, '/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })
  return await res.json()
}

// Test suites
async function testBasicCRUD() {
  console.log('🧪 Testing Basic CRUD Operations...')

  // Use a temporary database file to ensure clean state
  const testDbPath = path.join(process.cwd(), 'basic-crud-test.db')
  
  // Clean up any existing test file
  try {
    fs.unlinkSync(testDbPath)
  } catch {
    // Ignore if file doesn't exist
  }

  // Set environment variable for test database
  const originalDbFile = process.env.DB_FILE
  process.env.DB_FILE = testDbPath
  
  // Reset store to pick up new DB_FILE
  resetStore()

  const server = createApp().listen(0)
  await once(server, 'listening')

  await auth(server)

  await auth(server)

  await auth(server)

  await auth(server)

  try {
    // Test GET empty list
    let res = await makeRequest(server, '/api/documents')
    assert.strictEqual(res.status, 200)
    let data = await res.json()
    assert.deepStrictEqual(data.documents, [])

    // Test POST create document
    res = await makeRequest(server, '/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test', content: 'Hello World' }),
    })
    assert.strictEqual(res.status, 201)
    const doc = await res.json()
    assert.strictEqual(doc.title, 'Test')
    assert.strictEqual(doc.content, 'Hello World')
    assert(doc.id, 'Document should have an ID')

    const id = doc.id

    // Test GET by ID
    res = await makeRequest(server, `/api/documents/${id}`)
    assert.strictEqual(res.status, 200)
    const single = await res.json()
    assert.strictEqual(single.id, id)
    assert.strictEqual(single.title, 'Test')

    // Test PUT update
    res = await makeRequest(server, `/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated Title',
        content: 'Updated Content',
      }),
    })
    assert.strictEqual(res.status, 200)
    const updated = await res.json()
    assert.strictEqual(updated.title, 'Updated Title')
    assert.strictEqual(updated.content, 'Updated Content')

    // Test PATCH partial update
    res = await makeRequest(server, `/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Patched Title' }),
    })
    assert.strictEqual(res.status, 200)
    const patched = await res.json()
    assert.strictEqual(patched.title, 'Patched Title')
    assert.strictEqual(patched.content, 'Updated Content') // Should preserve content

    // Test DELETE
    res = await makeRequest(server, `/api/documents/${id}`, {
      method: 'DELETE',
    })
    assert.strictEqual(res.status, 204)

    // Verify deletion
    res = await makeRequest(server, `/api/documents/${id}`)
    assert.strictEqual(res.status, 404)

    console.log('✅ Basic CRUD tests passed')
  } finally {
    server.close()
    
    // Restore original DB_FILE setting
    if (originalDbFile) {
      process.env.DB_FILE = originalDbFile
    } else {
      delete process.env.DB_FILE
    }
    
    // Clean up test file
    try {
      fs.unlinkSync(testDbPath)
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...')

  // Use a temporary database file to ensure clean state
  const testDbPath = path.join(process.cwd(), 'error-handling-test.db')
  
  // Clean up any existing test file
  try {
    fs.unlinkSync(testDbPath)
  } catch {
    // Ignore if file doesn't exist
  }

  // Set environment variable for test database
  const originalDbFile = process.env.DB_FILE
  process.env.DB_FILE = testDbPath
  
  // Reset store to pick up new DB_FILE
  resetStore()

  const server = createApp().listen(0)
  await once(server, 'listening')

  try {
    // Test 404 for non-existent document
    let res = await makeRequest(server, '/api/documents/999')
    assert.strictEqual(res.status, 404)
    let error = await res.json()
    assert.strictEqual(error.error, 'Not found')

    // Test 400 for invalid JSON
    res = await makeRequest(server, '/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    })
    assert.strictEqual(res.status, 400)
    error = await res.json()
    assert.strictEqual(error.error, 'Invalid JSON')

    // Test 404 for invalid endpoint
    res = await makeRequest(server, '/api/invalid')
    assert.strictEqual(res.status, 404)

    // Test missing required fields
    res = await makeRequest(server, '/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'No Content' }),
    })
    // Should be rejected when content is missing
    assert.strictEqual(res.status, 400)

    // Test update non-existent document
    res = await makeRequest(server, '/api/documents/999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    })
    assert.strictEqual(res.status, 404)

    // Test delete non-existent document
    res = await makeRequest(server, '/api/documents/999', { method: 'DELETE' })
    assert.strictEqual(res.status, 404)

    console.log('✅ Error handling tests passed')
  } finally {
    server.close()
    
    // Restore original DB_FILE setting
    if (originalDbFile) {
      process.env.DB_FILE = originalDbFile
    } else {
      delete process.env.DB_FILE
    }
    
    // Clean up test file
    try {
      fs.unlinkSync(testDbPath)
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

async function testDataPersistence() {
  console.log('🧪 Testing Data Persistence...')

  // Test with temporary database file
  const testDbPath = path.join(process.cwd(), 'test.db')
  // Clean up any existing test file
  try {
    fs.unlinkSync(testDbPath)
  } catch {
    // Ignore if file doesn't exist
  }

  // Set environment variable for test database
  const originalDbFile = process.env.DB_FILE
  process.env.DB_FILE = testDbPath
  
  // Reset store to pick up new DB_FILE
  resetStore()

  try {
    // Start first server instance
    const server1 = createApp().listen(0)
    await once(server1, 'listening')

    await auth(server1)

    // Create a document
    await createTestDocument(server1, 'Persistent Doc', 'This should persist')

    // Get all documents
    let res = await makeRequest(server1, '/api/documents')
    let data = await res.json()
    assert.strictEqual(data.documents.length, 1)
    assert.strictEqual(data.documents[0].title, 'Persistent Doc')

    server1.close()

    // Start second server instance (simulating restart)
    const server2 = createApp().listen(0)
    await once(server2, 'listening')

    await auth(server2)

    // Check if data persisted
    res = await makeRequest(server2, '/api/documents')
    data = await res.json()
    assert.strictEqual(data.documents.length, 1)
    assert.strictEqual(data.documents[0].title, 'Persistent Doc')

    server2.close()

    console.log('✅ Data persistence tests passed')
  } finally {
    // Restore original environment
    if (originalDbFile) {
      process.env.DB_FILE = originalDbFile
    } else {
      delete process.env.DB_FILE
    }
    // Clean up test file
    try {
      fs.unlinkSync(testDbPath)
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

async function testConcurrency() {
  console.log('🧪 Testing Concurrent Operations...')

  // Use a temporary database file to ensure clean state
  const testDbPath = path.join(process.cwd(), 'concurrency-test.db')
  
  // Clean up any existing test file
  try {
    fs.unlinkSync(testDbPath)
  } catch {
    // Ignore if file doesn't exist
  }

  // Set environment variable for test database
  const originalDbFile = process.env.DB_FILE
  process.env.DB_FILE = testDbPath
  
  // Reset store to pick up new DB_FILE
  resetStore()

  const server = createApp().listen(0)
  await once(server, 'listening')

  try {
    // Create multiple documents concurrently
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(createTestDocument(server, `Doc ${i}`, `Content ${i}`))
    }

    const results = await Promise.all(promises)
    assert.strictEqual(results.length, 10)

    // Verify all documents were created
    const res = await makeRequest(server, '/api/documents')
    const data = await res.json()
    assert.strictEqual(data.documents.length, 10)

    // Test concurrent updates
    const updatePromises = results.map(doc =>
      makeRequest(server, `/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Updated ${doc.title}` }),
      })
    )

    await Promise.all(updatePromises)

    console.log('✅ Concurrency tests passed')
  } finally {
    server.close()
    
    // Restore original DB_FILE setting
    if (originalDbFile) {
      process.env.DB_FILE = originalDbFile
    } else {
      delete process.env.DB_FILE
    }
    
    // Clean up test file
    try {
      fs.unlinkSync(testDbPath)
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

async function testLargeData() {
  console.log('🧪 Testing Large Data Handling...')

  // Use a temporary database file to ensure clean state
  const testDbPath = path.join(process.cwd(), 'large-data-test.db')
  
  // Clean up any existing test file
  try {
    fs.unlinkSync(testDbPath)
  } catch {
    // Ignore if file doesn't exist
  }

  // Set environment variable for test database
  const originalDbFile = process.env.DB_FILE
  process.env.DB_FILE = testDbPath
  
  // Reset store to pick up new DB_FILE
  resetStore()

  const server = createApp().listen(0)
  await once(server, 'listening')

  try {
    // Test with large content
    const largeContent = 'x'.repeat(10000) // 10KB content
    const doc = await createTestDocument(server, 'Large Document', largeContent)

    // Verify it was stored correctly
    const res = await makeRequest(server, `/api/documents/${doc.id}`)
    const retrieved = await res.json()
    assert.strictEqual(retrieved.content.length, 10000)

    console.log('✅ Large data tests passed')
  } finally {
    server.close()
    
    // Restore original DB_FILE setting
    if (originalDbFile) {
      process.env.DB_FILE = originalDbFile
    } else {
      delete process.env.DB_FILE
    }
    
    // Clean up test file
    try {
      fs.unlinkSync(testDbPath)
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Enhanced Test Suite...\n')

  try {
    await testBasicCRUD()
    await testErrorHandling()
    await testDataPersistence()
    await testConcurrency()
    await testLargeData()

    console.log('\n🎉 All tests passed successfully!')
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

runAllTests()
