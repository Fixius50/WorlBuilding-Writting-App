@echo off
setlocal enabledelayedexpansion
title Worldbuilding App - Hybrid Runner
echo ==========================================
echo   Limpia y Arranca: Frontend + Backend
echo ==========================================

:: Asegurar que el directorio de trabajo es el del script
cd /d "%~dp0"

:: 1. Limpieza de procesos previos
echo [1/4] Limpiando procesos antiguos...
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo OK.

:: 2. Preparar el Backend
echo [2/4] Verificando Backend...
set "JAR_PATH=target\aux-server-1.0.0.jar"

if exist "%JAR_PATH%" (
    echo [OK] Backend ya compilado. Saltando a ejecucion...
    goto launch_backend
)

echo [!] El archivo JAR no existe. Compilando el proyecto unificado...

:: Comprobar Maven global o usar Wrapper raiz
where mvn >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo [OK] Usando Maven Global...
    call mvn package -DskipTests
) else (
    echo [OK] Usando Maven Wrapper raiz...
    call mvnw.cmd package -DskipTests
)

if errorlevel 1 (
    echo [X] Error critico: La compilacion fallo.
    pause
    exit /b
)

:launch_backend
echo [3/4] Lanzando Backend en puerto 8080...
set "JAVA_OPTS=--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED"
start "Worldbuilding-Backend" cmd /k "java %JAVA_OPTS% --enable-preview -jar target\aux-server-1.0.0.jar"

:: 4. Arrancar Frontend
echo [4/4] Lanzando Frontend (Vite)...
npm run dev

echo ==========================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080
echo ==========================================
pause
