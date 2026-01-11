@echo off
setlocal

echo ===================================================
echo   WORLDBUILDING APP - LAUNCHER
echo ===================================================
echo.

echo [1/3] Limpiando Cache de Vite (Frontend)...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo    - Cache eliminada.
) else (
    echo    - Cache limpia.
)

echo.
echo [2/3] Iniciando Backend (Spring Boot)...
echo    - Abriendo nueva ventana...
start "Worldbuilding Backend" cmd /k ".\mvnw.cmd spring-boot:run"

echo.
echo [3/3] Iniciando Frontend (Vite)...
echo    - Ejecutando modo desarrollo...
npm run dev

endlocal
