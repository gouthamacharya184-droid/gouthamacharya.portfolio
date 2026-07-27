@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  start-frontend.bat — Start the portfolio frontend on Windows
REM
REM  Run this file by double-clicking it, or from any terminal (CMD or PowerShell):
REM     .\start-frontend.bat
REM
REM  It uses "cmd /c npm" internally so it works even when PowerShell
REM  execution policies block npm.ps1.
REM ─────────────────────────────────────────────────────────────────────────────

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   Goutham Portfolio — Frontend Startup   ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0frontend"

echo [1/2] Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo  ERROR: npm install failed. Make sure Node.js is installed.
    echo  Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/2] Starting Vite dev server (port 5173)...
echo  Open: http://localhost:5173
echo  Press Ctrl+C to stop.
echo.
call npm run dev
pause
