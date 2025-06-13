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

---

# Hierarchical Notebooks Update
**Date**: June 13, 2025 07:05 UTC

Implemented initial support for notebooks, section groups, sections and pages.
Backend exposes new REST endpoints and SQLite tables to store the hierarchy.
Frontend now has dropdowns to select and create these structures when
creating notes.

### Next Steps
**For Claude**
- Review Azure deployment after schema update
- Test new endpoints in production

**For Code**
- Expand tests to cover notebook and section features
- Refine UI styling for new fields

## GitHub Actions Deployment Fix
**Date**: 2025-06-13 07:59 UTC

Fixed empty deploy.yml file causing "No event triggers defined" error. Restored deployment workflow with push and manual triggers.

### Next Steps
**For Claude**
- Trigger new deployment and monitor logs

**For Code**
- Ensure future YAML edits maintain `on:` block
