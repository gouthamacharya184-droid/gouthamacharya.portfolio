@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  start-backend.bat — Start the portfolio backend on Windows
REM
REM  Run this file by double-clicking it, or from any terminal (CMD or PowerShell):
REM     .\start-backend.bat
REM
REM  It uses "cmd /c npm" internally so it works even when PowerShell
REM  execution policies block npm.ps1.
REM ─────────────────────────────────────────────────────────────────────────────

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   Goutham Portfolio — Backend Startup    ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0backend"

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
echo [2/2] Starting backend server (port 8787)...
echo  Press Ctrl+C to stop.
echo.
call npm run dev
pause
