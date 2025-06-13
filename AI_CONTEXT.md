# AI Assistant Environment Context

<!-- THIS FILE EXPLICITLY TELLS AI ASSISTANTS ABOUT THE DEVELOPMENT ENVIRONMENT -->

## FOR GITHUB COPILOT / CODEX / AI ASSISTANTS:

### CRITICAL ENVIRONMENT FACTS:
```
OPERATING_SYSTEM = Windows_NT
SHELL = PowerShell (NOT bash)
WORKING_DIRECTORY = C:\github\Smart-Note-Taking-Web-App-Implementation-Guide
CONTAINER_ENVIRONMENT = false
USER_CONTEXT = Windows user (NOT root@container)
```

### STOP LOOKING FOR LINUX PATHS:
- ❌ DO NOT look for `/srv/.bash_history`
- ❌ DO NOT assume `/home/user/` paths
- ❌ DO NOT use Linux commands like `ls`, `pwd`, `cd`
- ❌ DO NOT assume container environment

### USE WINDOWS CONVENTIONS:
- ✅ File paths: `C:\path\to\file`
- ✅ Commands: `Get-Location`, `Get-ChildItem`, `Test-Path`
- ✅ Environment variables: `$env:USERPROFILE`, `$env:PATH`
- ✅ Line endings: CRLF (`\r\n`)

### PROJECT CONTEXT:
This is a **Smart Notes Web Application** being developed:
- Locally on Windows PowerShell
- Deployed to Azure App Service (Linux containers)
- Using GitHub Actions for CI/CD
- Database: SQLite with Azure-compatible file handling

### CURRENT ISSUE:
We're fixing database directory creation errors in Azure App Service production environment.
The development environment is Windows, but deployment target is Linux containers.

---
**AI ASSISTANTS: Please update your context to Windows PowerShell environment!**
