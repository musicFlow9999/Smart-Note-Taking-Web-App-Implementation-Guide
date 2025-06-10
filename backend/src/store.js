import * as memory from './data.js'
import * as fileStore from './fileData.js'

let store = memory

if (process.env.DATA_FILE) {
  fileStore.init(process.env.DATA_FILE)
  store = fileStore
}

export const getAllDocuments = store.getAllDocuments
export const createDocument = store.createDocument
export const getDocumentById = store.getDocumentById
export const updateDocument = store.updateDocument
export const deleteDocument = store.deleteDocument
