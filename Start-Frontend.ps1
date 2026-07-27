# Start-Frontend.ps1 — Run this from PowerShell to start the frontend
# Usage: .\Start-Frontend.ps1
#
# This script uses npm.cmd instead of npm to bypass the PowerShell
# execution policy restriction on npm.ps1

Set-Location "$PSScriptRoot\frontend"

Write-Host ""
Write-Host "  Installing frontend dependencies..." -ForegroundColor Cyan
npm.cmd install

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm install failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  Starting Vite dev server on port 5173..." -ForegroundColor Green
Write-Host "  Open: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

npm.cmd run dev
