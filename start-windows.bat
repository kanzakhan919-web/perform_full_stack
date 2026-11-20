@echo off
title Perform360 - Next.js + MongoDB
cd /d %~dp0
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js is not installed. Please install the LTS version from https://nodejs.org/
 pause
 exit /b
)

if not exist node_modules (
 echo Installing packages...
 call npm install
)

echo Starting Perform360 (website + API) on http://localhost:3000 ...
start "Perform360" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 8 >nul
start "" http://localhost:3000
echo The server is running in its own window. Close that window to stop it.
pause
