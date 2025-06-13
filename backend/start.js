import { createApp } from './src/server.js'

const PORT = process.env.PORT || 5000
const app = createApp()

app.listen(PORT, () => {
  console.log(`🚀 Smart Notes Server running on http://localhost:${PORT}`)
  console.log(`📝 API available at http://localhost:${PORT}/api/documents`)
  if (process.env.DB_FILE) {
    console.log(`💾 Using SQLite database: ${process.env.DB_FILE}`)
    if (
      process.env.RESET_DB_ON_START === 'true' ||
      process.env.RESET_DB_ON_START === '1'
    ) {
      console.log('⚠️ RESET_DB_ON_START enabled - database will be recreated')
    }
  } else if (process.env.DATA_FILE) {
    console.log(`📄 Using file storage: ${process.env.DATA_FILE}`)
  } else {
    console.log(`🧠 Using in-memory storage`)
  }
})
