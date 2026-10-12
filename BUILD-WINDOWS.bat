@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo   Diesel ECU Workbench - Windows Installer Build
echo ================================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install the current Node.js LTS from https://nodejs.org/ then run this file again.
  pause
  exit /b 1
)
echo Installing build dependencies. Internet is required for this first step...
call npm install
if errorlevel 1 (
  echo.
  echo Dependency installation failed. Check your internet connection and try again.
  pause
  exit /b 1
)
echo.
echo Building the Windows setup installer...
call npm run dist:win
if errorlevel 1 (
  echo Installer build failed.
  pause
  exit /b 1
)
echo.
echo Finished. Look in the release folder for Diesel-ECU-Workbench-Setup-1.0.0.exe
pause
