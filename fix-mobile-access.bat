@echo off
color 0A
title Fix Mobile Access - Run as Administrator

:: Check for admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo  ============================================
    echo   YOU MUST RIGHT-CLICK THIS FILE AND SELECT
    echo   "Run as administrator"
    echo  ============================================
    echo.
    pause
    exit /b 1
)

echo.
echo  ============================================
echo   Running as Administrator - Good!
echo  ============================================

:: Remove old rules silently
netsh advfirewall firewall delete rule name="Vite Dev Port 5173" >nul 2>&1
netsh advfirewall firewall delete rule name="Portfolio Backend Port 8787" >nul 2>&1

:: Add new rules for ALL network profiles (including Public WiFi)
netsh advfirewall firewall add rule name="Vite Dev Port 5173" dir=in action=allow protocol=TCP localport=5173 profile=any
netsh advfirewall firewall add rule name="Portfolio Backend Port 8787" dir=in action=allow protocol=TCP localport=8787 profile=any

echo.
echo  ============================================
echo   DONE! Firewall ports opened.
echo.
echo   Open on your phone (same WiFi):
echo   http://192.168.0.121:5173
echo  ============================================
echo.
pause
