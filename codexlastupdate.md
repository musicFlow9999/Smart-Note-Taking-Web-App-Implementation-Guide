## ⚙️ Update 2025-06-13

Implemented runtime migration check to ensure the `user_id` column exists in the SQLite database. The `init` function now inspects the schema using `PRAGMA table_info` and adds the column if missing. This prevents "no such column" errors when inserting documents on deployments with older databases.

### Next Steps
- **For Claude:** Verify deployment logs on Azure and confirm that document creation no longer returns a 500 error.
- **For Code:** Expand tests to cover the migration logic once dependencies are available.
