import * as memory from './data.js'
import * as fileStore from './fileData.js'

let store = memory
let storeInitialized = false

async function initializeStore() {
  if (storeInitialized) return

  if (process.env.DB_FILE) {
    // Dynamic import to avoid top-level await
    const sqliteStoreModule = await import('./sqliteStoreJS.js')
    await sqliteStoreModule.init(process.env.DB_FILE)
    store = sqliteStoreModule
  } else if (process.env.DATA_FILE) {
    fileStore.init(process.env.DATA_FILE)
    store = fileStore
  }

  storeInitialized = true
}

// Function to reset store for testing
export function resetStore() {
  storeInitialized = false
  store = memory
}

export const getAllDocuments = async (...args) => {
  await initializeStore()
  return store.getAllDocuments(...args)
}

export const createDocument = async (...args) => {
  await initializeStore()
  return store.createDocument(...args)
}

export const getDocumentById = async (...args) => {
  await initializeStore()
  return store.getDocumentById(...args)
}

export const updateDocument = async (...args) => {
  await initializeStore()
  return store.updateDocument(...args)
}

export const deleteDocument = async (...args) => {
  await initializeStore()
  return store.deleteDocument(...args)
}

export const getAllNotebooks = async (...args) => {
  await initializeStore()
  return store.getAllNotebooks(...args)
}

export const createNotebook = async (...args) => {
  await initializeStore()
  return store.createNotebook(...args)
}

export const getAllSectionGroups = async (...args) => {
  await initializeStore()
  return store.getAllSectionGroups(...args)
}

export const createSectionGroup = async (...args) => {
  await initializeStore()
  return store.createSectionGroup(...args)
}

export const getAllSections = async (...args) => {
  await initializeStore()
  return store.getAllSections(...args)
}

export const createSection = async (...args) => {
  await initializeStore()
  return store.createSection(...args)
}
