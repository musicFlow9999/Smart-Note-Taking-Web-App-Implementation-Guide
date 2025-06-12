import * as memory from './data.js'
import * as fileStore from './fileData.js'
import * as sqliteStore from './sqliteStore.js'

let store = memory

if (process.env.DB_FILE) {
  sqliteStore.init(process.env.DB_FILE)
  store = sqliteStore
} else if (process.env.DATA_FILE) {
  fileStore.init(process.env.DATA_FILE)
  store = fileStore
}

export const getAllDocuments = (...args) => store.getAllDocuments(...args)
export const createDocument = (...args) => store.createDocument(...args)
export const getDocumentById = (...args) => store.getDocumentById(...args)
export const updateDocument = (...args) => store.updateDocument(...args)
export const deleteDocument = (...args) => store.deleteDocument(...args)
