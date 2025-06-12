import { createApp } from '../src/server.js'
import { once } from 'events'
import assert from 'assert'

async function run() {
  const server = createApp().listen(0)
  await once(server, 'listening')
  const { port } = server.address()

  // Register and login to obtain token
  let res = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'basicuser',
      email: 'basic@example.com',
      password: 'pass1234',
    }),
  })

  assert.strictEqual(res.status, 201)
  let authData = await res.json()
  const token = authData.accessToken

  res = await fetch(`http://localhost:${port}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  assert.strictEqual(res.status, 200)
  let data = await res.json()
  assert.deepStrictEqual(data.documents, [])

  res = await fetch(`http://localhost:${port}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'Test', content: 'Hello' }),
  })
  assert.strictEqual(res.status, 201)
  const doc = await res.json()
  assert.strictEqual(doc.title, 'Test')

  const id = doc.id

  res = await fetch(`http://localhost:${port}/api/documents/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  assert.strictEqual(res.status, 200)
  const single = await res.json()
  assert.strictEqual(single.id, id)

  res = await fetch(`http://localhost:${port}/api/documents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'Updated' }),
  })
  assert.strictEqual(res.status, 200)
  const updated = await res.json()
  assert.strictEqual(updated.title, 'Updated')

  res = await fetch(`http://localhost:${port}/api/documents/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  assert.strictEqual(res.status, 204)

  res = await fetch(`http://localhost:${port}/api/documents/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  assert.strictEqual(res.status, 404)

  res = await fetch(`http://localhost:${port}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data2 = await res.json()
  assert.strictEqual(data2.documents.length, 0)

  server.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
