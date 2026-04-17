@echo off
setlocal enabledelayedexpansion
title Worldbuilding App - Hybrid Runner
echo ==========================================
echo   Limpia y Arranca: Frontend + Backend
echo ==========================================

:: Asegurar que el directorio de trabajo es la raiz
cd /d "%~dp0.."

:: 1. Limpieza de procesos previos
echo [1/4] Limpiando procesos antiguos...
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo OK.

echo [4/4] Lanzando Frontend (Vite)...
cd frontend
npm run dev

echo ==========================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080
echo ==========================================
pause
