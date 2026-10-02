@echo off
title DocuVault - Spring Boot Backend
echo ========================================================
echo Starting DocuVault Spring Boot Backend on Port 8085...
echo ========================================================
cd /d "%~dp0backend"
call mvn spring-boot:run
pause
