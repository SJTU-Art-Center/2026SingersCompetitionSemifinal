@echo off
echo =========================================
echo   Super Singer System - Quick Start
echo =========================================

echo.
echo [1/2] Starting Backend Server (Port:3001)...
start /b "" cmd /c "cd server && npm install && node index.js"

echo.
echo [2/2] Starting Frontend App (Port:5173)...
start /b "" cmd /c "cd client && npm install && npm run dev -- --host"

echo.
echo =========================================
echo ALL SERVICES STARTED!
echo.
echo Open on THIS computer:
echo Admin Panel:  http://localhost:5173/admin
echo Big Screen:   http://localhost:5173/screen
echo.
echo To access from other devices on the same Wi-Fi, 
echo replace 'localhost' with your IPv4 Address.
echo =========================================
echo (Press Ctrl+C and type 'Y' to completely stop the servers)
echo.
pause
