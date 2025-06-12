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
   Set the `DATA_FILE` environment variable to persist documents to a JSON file.
   Alternatively, provide a `DB_FILE` path to use a SQLite database.

3. Run the test suite:

  ```bash
  npm test
  ```

### Database Configuration

To store notes in SQLite instead of memory, set the `DB_FILE` environment
variable to the path of a `.db` file before starting the server. The database
and required table will be created automatically if they do not exist.

## API Endpoints

- `GET /api/documents` – list all documents
- `POST /api/documents` – create a new document (expects JSON `{ title, content }`)
- `GET /api/documents/:id` – get a document by id
- `PUT /api/documents/:id` – update a document
- `DELETE /api/documents/:id` – remove a document

By default, documents are stored in memory so they reset when the server restarts.
Set a `DATA_FILE` path to persist them across sessions, or consider using a database for a real application.

## Next Steps

The following improvements are recommended but not yet implemented:

<!-- Database integration implemented -->
- Database integration via SQLite is now available. Set `DB_FILE` to a path
  to use a SQLite database instead of the in-memory array.
- A web frontend for interacting with the API is available in `frontend/index.html`.
- Expand tests to cover edge cases and database logic once added.
- Additional authentication test verifies refresh tokens are invalidated after logout.
- Continuous integration is configured with GitHub Actions to run tests automatically.
- Configure continuous deployment to Azure with GitHub Actions.
- Set up a custom domain and HTTPS for the web app.
- Add authentication and user management.

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
     --name <your-app-name> --runtime "NODE|20-lts"
   az webapp deploy --resource-group smart-notes-rg --name <your-app-name> \
     --src-path backend
   ```
4. Set the `PORT` environment variable in the web app settings if needed.

This deploys the API to Azure so it can be accessed publicly.

### Deployed Instance

The backend is currently running on Azure and can be accessed at:

- URL: <http://smart-notes-app-lamb2025.azurewebsites.net>
- Resource Group: `smart-notes-rg-west` (West US)
- App Service Plan: `smart-notes-plan` (Free tier)
- Web App Name: `smart-notes-app-lamb2025`
- Runtime: Node.js 20 LTS

The `GET /api/documents` and `POST /api/documents` endpoints have been tested and are working as expected. A test entry titled "Azure Test Document" was successfully stored.


