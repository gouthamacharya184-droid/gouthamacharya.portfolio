# Start-Backend.ps1 — Run this from PowerShell to start the backend
# Usage: .\Start-Backend.ps1
#
# This script uses npm.cmd instead of npm to bypass the PowerShell
# execution policy restriction on npm.ps1

Set-Location "$PSScriptRoot\backend"

Write-Host ""
Write-Host "  Installing backend dependencies..." -ForegroundColor Cyan
npm.cmd install

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm install failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  Starting backend server on port 8787..." -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

npm.cmd run dev
