# Smart-Note-Taking-Web-App-Implementation-Guide

This repository contains a simple Node.js backend used to experiment with a smart note taking API.
It exposes REST endpoints for creating, reading, updating and deleting documents that are stored in
memory. The server is intended as a starting point for further development.

## Prerequisites

- Node.js 18 or newer

## Getting Started

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

   The API will be available at `http://localhost:5000` by default.

3. Run the test suite:

   ```bash
   npm test
   ```

## API Endpoints

- `GET /api/documents` – list all documents
- `POST /api/documents` – create a new document (expects JSON `{ title, content }`)
- `GET /api/documents/:id` – get a document by id
- `PUT /api/documents/:id` – update a document
- `DELETE /api/documents/:id` – remove a document

Data is stored in memory so it will reset when the server restarts.
Consider adding a database or persistence layer for a real application.

## Next Steps

The following improvements are recommended but not yet implemented:

- Use a database (e.g. SQLite, MongoDB) instead of the in-memory array.
- Create a frontend interface to interact with the API.
- Expand tests to cover edge cases and database logic once added.
- Set up continuous integration to run tests automatically.

### Deploying to Azure

If you use Azure, you can host the backend on Azure App Service:

1. Install the Azure CLI and sign in with `az login`.
2. Create a resource group and App Service plan:
   ```bash
   az group create --name smart-notes-rg --location eastus
   az appservice plan create --name smart-notes-plan --resource-group smart-notes-rg --sku B1 --is-linux
   ```
3. Create the web app and deploy the Node.js backend:
   ```bash
   az webapp create --resource-group smart-notes-rg --plan smart-notes-plan \
     --name <your-app-name> --runtime "NODE|18-lts"
   az webapp deploy --resource-group smart-notes-rg --name <your-app-name> \
     --src-path backend
   ```
4. Set the `PORT` environment variable in the web app settings if needed.

This deploys the API to Azure so it can be accessed publicly.


