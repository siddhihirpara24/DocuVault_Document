@echo off
title DocuVault Launcher
echo ========================================================
echo   Launching DocuVault Personal Document Organizer
echo ========================================================
echo.
echo 1. Starting Backend in a new window...
start "DocuVault Backend (Port 8085)" cmd /k "%~dp0run-backend.bat"
timeout /t 3 /nobreak >nul

echo 2. Starting Frontend in a new window...
start "DocuVault Frontend (Port 5173)" cmd /k "%~dp0run-frontend.bat"
timeout /t 2 /nobreak >nul

echo.
echo ========================================================
echo   DocuVault is starting up!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8085
echo ========================================================
echo.
pause
