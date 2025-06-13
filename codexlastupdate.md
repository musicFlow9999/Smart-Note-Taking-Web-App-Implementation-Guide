## Current Issue: Database Schema Mismatch

**PROBLEM IDENTIFIED:**
- Users getting 500 Internal Server Error when trying to create notes
- Root cause: Database schema missing `user_id` column in documents table
- Error: "no such column: user_id" when INSERT statement tries to add documents
- Existing database on Azure was created with old schema without proper user_id support

**ATTEMPTED FIX:**
- Added database migration code in `sqliteStoreJS.js` to:
  - Add `user_id` column if missing: `ALTER TABLE documents ADD COLUMN user_id TEXT`
  - Update existing documents: `UPDATE documents SET user_id = 'legacy-user' WHERE user_id IS NULL`
  - Set user_id as NOT NULL in table creation

**CURRENT STATUS:**
- Migration code deployed to Azure (commit a9181ee)
- App restart attempted but still getting 500 errors
- Azure CLI showing null values for environment variables (may be display issue)
- Health endpoint responding 200 OK but document creation still failing

**NEXT STEPS FOR CODEX:**
1. Verify environment variables are actually set correctly on Azure
2. Consider forcing complete database recreation by changing DB_FILE path
3. Test if migration ran successfully by checking actual database schema
4. Alternative: Delete existing database file to force fresh creation
5. Validate INSERT query and user authentication flow

**FILES MODIFIED:**
- `backend/src/sqliteStoreJS.js` - Added migration logic for user_id column
- Security credentials removed from frontend (completed earlier)

**LOG EVIDENCE:**
```
{"error":"no such column: user_id","level":"error","message":"Unhandled error" ... at Module.init (file:///home/site/wwwroot/src/sqliteStoreJS.js:61:6)
```
