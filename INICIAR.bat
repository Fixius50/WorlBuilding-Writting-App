@echo off
cls
echo ========================================
echo  WorldBuilding App V2 - INICIAR
echo ========================================
echo.

REM Limpiar instancias previas
echo [0/3] Limpiando procesos anteriores...
taskkill /F /IM java.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo [OK] Entorno limpio.
echo.

REM Construir Frontend
echo [1/3] Construyendo Frontend (React)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo al construir el frontend.
    pause
    exit /b 1
)
echo [OK] Frontend actualizado.
echo.

REM Crear script de auto-restart para backend
echo [2/3] Preparando Backend con Auto-Restart...
echo @echo off > backend_runner.bat
echo :START >> backend_runner.bat
echo call mvnw.cmd clean spring-boot:run >> backend_runner.bat
echo if exist restart.flag ( >> backend_runner.bat
echo     del restart.flag >> backend_runner.bat
echo     timeout /t 2 /nobreak ^>nul >> backend_runner.bat
echo     goto START >> backend_runner.bat
echo ) >> backend_runner.bat

REM Iniciar backend en segundo plano
start /b cmd /c backend_runner.bat
echo [OK] Backend iniciando en segundo plano...
echo.

REM Esperar a que el backend arranque
echo [3/3] Esperando a que el backend inicie (15 segundos)...
timeout /t 15 /nobreak >nul

REM Iniciar Frontend
echo.
echo ========================================
echo  FRONTEND INICIANDO...
echo  Backend: http://localhost:8080
echo  Frontend: http://localhost:3000
echo ========================================
echo.
echo NOTA: Para detener todo, presiona Ctrl+C
echo.

call npm run dev

REM Limpiar
if exist backend_runner.bat del backend_runner.bat
