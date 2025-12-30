@echo off
cls
echo ========================================
echo  WorldBuilding App V2 - INICIAR
echo ========================================
echo.

REM Construir Frontend
echo [2/4] Construyendo Frontend (React)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo al construir el frontend.
    pause
    exit /b 1
)
echo [OK] Frontend actualizado.
echo.

REM Limpiar compilaciones anteriores (Java)
echo [3/4] Limpiando compilaciones anteriores...
if exist target rmdir /s /q target 2>nul
echo [OK] Limpieza completada
echo.

REM Iniciar la aplicacion
echo [4/4] Iniciando WorldBuilding App V2...
echo.
echo ========================================
echo  La aplicacion se esta iniciando...
echo  Espera a ver: "Started WorldbuildingApplication"
echo  Luego abre: http://localhost:8080
echo ========================================
echo.

call mvnw.cmd spring-boot:run

pause
