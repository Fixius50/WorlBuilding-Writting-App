@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   WorldbuildingApp Auto-Restart Server
echo ========================================
echo.

:START
echo [%TIME%] Iniciando servidor con clean...
call mvnw.cmd clean spring-boot:run

REM Check if restart.flag exists
if exist restart.flag (
    echo [%TIME%] Archivo restart.flag detectado. Reiniciando...
    del restart.flag
    timeout /t 2 /nobreak >nul
    goto START
)

REM If we get here, the server stopped without restart flag
echo [%TIME%] Servidor detenido. Presiona cualquier tecla para reiniciar o Ctrl+C para salir.
pause >nul
goto START
