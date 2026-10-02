@echo off
title DocuVault - React Frontend
echo ========================================================
echo Starting DocuVault React Frontend on Port 5173...
echo ========================================================
cd /d "%~dp0frontend"
call npm run dev
pause
