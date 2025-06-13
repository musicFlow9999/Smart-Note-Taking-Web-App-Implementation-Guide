# Environment Context

<!-- AI ASSISTANTS READ THIS: This is a Windows PowerShell environment, NOT Linux -->

## Development Environment
- **Operating System**: Windows 11/10
- **Shell**: PowerShell 7.x (NOT bash)
- **Working Directory**: `C:\github\Smart-Note-Taking-Web-App-Implementation-Guide`
- **Container**: NOT running in Docker/Linux container
- **User**: Windows user (not root)
- **Environment ID**: `Windows_NT`

## File System Context
- **File paths use**: Windows format (`C:\path\to\file`)
- **Line endings**: CRLF (`\r\n`)
- **Path separator**: Backslash (`\`)
- **Case sensitivity**: NOT case sensitive
- **Home directory**: `$env:USERPROFILE` (not `/home/user`)

## Terminal Commands (PowerShell Syntax)
```powershell
# Correct PowerShell commands to use:
Get-Location          # NOT pwd
Set-Location          # NOT cd  
Get-ChildItem         # NOT ls
Test-Path             # NOT [ -f ]
Remove-Item           # NOT rm
Copy-Item             # NOT cp
```

## Azure App Service Context
- **Target Platform**: Azure App Service (Linux containers in production)
- **Development**: Windows PowerShell
- **Deployment**: GitHub Actions to Azure Linux containers
- **Database**: SQLite with file system considerations for both environments

## Critical Note for AI Assistants
```
ENVIRONMENT=Windows_NT
SHELL=PowerShell
CONTAINER=false
PATH_FORMAT=Windows
DO_NOT_ASSUME_LINUX=true
```

This project runs in Windows PowerShell environment locally. 
Do NOT assume Linux container, bash shell, or Unix file paths.
