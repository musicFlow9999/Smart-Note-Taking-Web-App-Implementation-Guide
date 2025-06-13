# Smart Notes Azure App Service - Database Directory Creation Issue
**Date**: June 13, 2025 05:55 UTC  
**Status**: PARTIALLY RESOLVED - DB_FILE path updated to /tmp/notes_v2.db

## ⚠️ CRITICAL ISSUE: ENOENT Directory Creation Error

The app previously threw 500 errors on document creation due to:
```
ENOENT: no such file or directory, mkdir '/home/site/wwwroot/data'
```

**Root Cause**: Azure App Service directory permissions prevented creating the original database directory.

**Environment**: smart-notes-app-lamb2025.azurewebsites.net (smart-notes-rg-west)

## Previous Fixes Completed ✅
- Database migration check for `user_id` column
- Environment variables (JWT_SECRET, DB_FILE, Application Insights)
- GitHub Actions deployment pipeline
- Enhanced logging and error handling
- Dependencies tracking in Git

## Current Status
- App Service: Running (health check passes)
- Database: Initialization failing on directory creation
- Logs: Enhanced but directory creation still fails despite fallback logic

### Next Steps
**IMMEDIATE**:
1. Verify the application writes to `/tmp/notes_v2.db` in Azure
2. Deploy and test the document creation API
3. Check Application Insights for any remaining errors

**ALTERNATIVE SOLUTIONS**:
- Explore Azure SQL or Azure Storage if `/tmp` path is not reliable
- Use in-memory database for smoke tests

**For Claude**
- Monitor deployment logs for database initialization success
- Confirm environment variables are correctly set in Azure

**For Code**
- Update `.env.production` and documentation with the new DB_FILE path
- Document these steps in `codexlastupdate.md`
