# Environment Detection Script for AI Assistants

Write-Host "=== ENVIRONMENT CONTEXT FOR AI ASSISTANTS ===" -ForegroundColor Green
Write-Host "OS: $($env:OS)" -ForegroundColor Yellow
Write-Host "Shell: PowerShell (NOT bash)" -ForegroundColor Yellow  
Write-Host "Working Directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "Container: false" -ForegroundColor Yellow
Write-Host "User: $($env:USERNAME) (NOT root)" -ForegroundColor Yellow
Write-Host "Path Separator: \ (backslash)" -ForegroundColor Yellow
Write-Host "Line Endings: CRLF" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Green

# This script demonstrates Windows PowerShell environment
# DO NOT use Linux commands like ls, pwd, cd, rm
# USE PowerShell commands: Get-Location, Get-ChildItem, Set-Location, Remove-Item
