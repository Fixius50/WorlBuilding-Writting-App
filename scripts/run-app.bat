@echo off
setlocal enabledelayedexpansion
title Worldbuilding App - Hybrid Runner
echo ==========================================
echo   Limpia y Arranca: Frontend + Backend
echo ==========================================

:: Asegurar que el directorio de trabajo es la raiz
cd /d "%~dp0.."

:: 1. Limpieza de procesos previos
echo [1/4] Liberando puerto 8080 ocupado por instancias previas del Backend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)
:: taskkill /F /IM node.exe /T 2>nul
echo OK.

echo [2/4] Iniciando Backend en segundo plano (Misma Terminal)...
cd backend
start /B "" cmd /c "mvnw.cmd compile exec:java -Dexec.mainClass=com.worldbuilding.core.AuxServerApplication" <nul
cd ..

echo Esperando a que el Backend este listo en el puerto 8080...
:wait_backend
netstat -ano | findstr /R /C:":8080 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    timeout /t 1 /nobreak >nul
    goto wait_backend
)
echo OK. Backend iniciado con exito.

echo [3/4] Buscando puerto disponible para Frontend...
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

echo [4/4] Iniciando Frontend...
cd frontend
npm run dev -- --port %PORT%
