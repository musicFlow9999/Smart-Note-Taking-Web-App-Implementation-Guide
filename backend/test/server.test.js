import { createApp } from '../src/server.js'
import { once } from 'events'
import assert from 'assert'

async function run() {
  const server = createApp().listen(0)
  await once(server, 'listening')
  const { port } = server.address()

  let res = await fetch(`http://localhost:${port}/api/documents`)
  assert.strictEqual(res.status, 200)
  let data = await res.json()
  assert.deepStrictEqual(data.documents, [])

  res = await fetch(`http://localhost:${port}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test', content: 'Hello' })
  })
  assert.strictEqual(res.status, 201)
  const doc = await res.json()
  assert.strictEqual(doc.title, 'Test')

  res = await fetch(`http://localhost:${port}/api/documents`)
  const data2 = await res.json()
  assert.strictEqual(data2.documents.length, 1)

  server.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
