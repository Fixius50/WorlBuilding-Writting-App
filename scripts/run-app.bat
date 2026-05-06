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
:: taskkill /F /IM node.exe /T 2>nul
echo OK.

echo [4/4] Buscando puerto disponible para Frontend...
set PORT=5173
:checkport
netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set /a PORT+=1
    goto checkport
)

echo OK. Usando puerto %PORT%
echo ==========================================
echo   Frontend: http://localhost:%PORT%
echo   Backend:  http://localhost:8080
echo ==========================================

cd frontend
npm run dev -- --port %PORT%

pause
