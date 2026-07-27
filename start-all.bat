@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  start-all.bat — Start both backend and frontend together (two windows)
REM ─────────────────────────────────────────────────────────────────────────────

echo.
echo  Starting backend in a new window...
start "Portfolio Backend" cmd /k "cd /d "%~dp0backend" && call npm install && call npm run dev"

echo  Starting frontend in a new window...
start "Portfolio Frontend" cmd /k "cd /d "%~dp0frontend" && call npm install && call npm run dev"

echo.
echo  Both servers are starting up in separate windows.
echo  Backend:  http://localhost:8787
echo  Frontend: http://localhost:5173
echo.
