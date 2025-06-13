# Smart Notes Azure App Service - Database Directory Creation Issue
**Date**: June 13, 2025 05:55 UTC  
**Status**: UNRESOLVED - Directory Creation Error Persists  
**Priority**: HIGH

## Current Problem
The Smart Notes Azure App Service is experiencing a **500 Internal Server Error** when attempting to create documents. The specific error is:

```
ENOENT: no such file or directory, mkdir '/home/site/wwwroot/data'
```

## Environment Details
- **App Service**: `smart-notes-app-lamb2025` 
- **Resource Group**: `smart-notes-rg-west`
- **URL**: https://smart-notes-app-lamb2025.azurewebsites.net
- **DB_FILE Setting**: `/home/site/wwwroot/data/notes_v2.db`
- **App Status**: Running (health check passes)

## Root Cause Analysis
The Node.js backend is failing to create the SQLite database directory in Azure App Service. Despite having:
1. ✅ Correct environment variables (JWT_SECRET, DB_FILE, etc.)
2. ✅ Application Insights configured and working
3. ✅ App Service running and healthy
4. ✅ Latest code deployed via GitHub Actions

The `fs.mkdirSync(dir, { recursive: true })` call in `sqliteStoreJS.js` is failing with ENOENT error.

## Actions Taken Today

### 1. Environment Variables Verification
- Confirmed all required env vars are set correctly
- DB_FILE points to `/home/site/wwwroot/data/notes_v2.db`
- JWT_SECRET, LOG_LEVEL, Application Insights keys all configured

### 2. Code Improvements
- Enhanced `sqliteStoreJS.js` with robust directory creation logic
- Added comprehensive error handling and logging
- Implemented fallback paths for Azure App Service:
  - `/tmp/data`
  - `{process.cwd()}/data`
  - `{__dirname}/../../data`
- Added proper ES modules support (`__dirname` equivalent)

### 3. Debugging Attempts
- Enabled debug-level logging
- Attempted to download and analyze Azure App Service logs
- Checked Application Insights for error patterns
- Verified GitHub Actions deployment pipeline

## Technical Details

### Modified Files
1. **backend/src/sqliteStoreJS.js**: Enhanced directory creation with fallback paths
2. **Various log files**: Downloaded for analysis but extraction had issues

### Error Stack Trace
```javascript
Error: ENOENT: no such file or directory, mkdir '/home/site/wwwroot/data'
    at Object.mkdirSync (node:fs:1372:26)
    at Module.init (file:///home/site/wwwroot/src/sqliteStoreJS.js:17:8)
    at initializeStore (file:///home/site/wwwroot/src/store.js:13:5)
    at createDocument (file:///home/site/wwwroot/src/store.js:35:3)
    at Server.<anonymous> (file:///home/site/wwwroot/src/server.js:266:23)
```

## Current Issues
1. **Log Access Problems**: Azure CLI log download commands are having extraction issues
2. **Directory Permissions**: Azure App Service `/home/site/wwwroot` might have permission restrictions
3. **Fallback Logic**: Alternative directory paths might not be triggering properly

## Next Steps Required

### Immediate Actions (HIGH PRIORITY)
1. **Test Alternative DB Paths**: 
   - Change DB_FILE to `/tmp/notes_v2.db` 
   - Or use `D:\home\data\notes_v2.db` (Azure App Service local storage)

2. **Enhanced Logging**: 
   - Add more detailed logging in the directory creation process
   - Log current working directory and permissions

3. **Manual Directory Testing**:
   - Use Kudu console to manually test directory creation
   - Check actual file system permissions

### Alternative Solutions
1. **Azure SQL Database**: Consider migrating from SQLite to Azure SQL for production
2. **Azure Storage**: Use Azure Blob Storage for database files
3. **In-Memory Database**: Temporary solution for testing

## Environment Commands
```bash
# Check app status
az webapp show --name smart-notes-app-lamb2025 --resource-group smart-notes-rg-west

# Update DB_FILE to alternative path
az webapp config appsettings set --name smart-notes-app-lamb2025 --resource-group smart-notes-rg-west --settings DB_FILE="/tmp/notes_v2.db"

# Restart app
az webapp restart --name smart-notes-app-lamb2025 --resource-group smart-notes-rg-west

# Test API
curl -X POST https://smart-notes-app-lamb2025.azurewebsites.net/api/documents \
  -H "Content-Type: application/json" \
  -H "User-Id: test-user-123" \
  -d '{"title":"Test","content":"Test content","tags":["test"]}'
```

## Code Status
- ✅ Latest changes committed and pushed to GitHub
- ✅ GitHub Actions deployment pipeline working
- ✅ App Service receiving updates correctly
- ❌ Database initialization still failing

## Monitoring
- Application Insights: Capturing errors but query access needs improvement
- Azure App Service Logs: Enabled but download/extraction having issues
- Health Check: Working correctly (returns 200 OK)

---
**Next Session**: Focus on testing alternative database paths and implementing more robust Azure App Service compatible storage solution.
