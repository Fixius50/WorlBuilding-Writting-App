@echo off
cls
echo ========================================
echo  WorldBuilding App V2 - INICIAR
echo ========================================
echo.

REM Verificar si MySQL esta corriendo (XAMPP)
echo [1/3] Verificando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] MySQL no esta corriendo
    echo.
    echo SOLUCION:
    echo 1. Abre XAMPP Control Panel
    echo 2. Haz clic en 'Start' en MySQL
    echo 3. Espera a que aparezca el fondo verde
    echo 4. Vuelve a ejecutar este archivo
    echo.
    pause
    exit /b 1
)

echo [OK] MySQL esta corriendo (mysqld.exe detectado)
echo.

REM Limpiar compilaciones anteriores
echo [2/3] Limpiando compilaciones anteriores...
if exist target rmdir /s /q target 2>nul
echo [OK] Limpieza completada
echo.

REM Iniciar la aplicacion
echo [3/3] Iniciando WorldBuilding App V2...
echo.
echo ========================================
echo  La aplicacion se esta iniciando...
echo  Espera a ver: "Started WorldbuildingApplication"
echo  Luego abre: http://localhost:8080
echo ========================================
echo.

mvnw.cmd spring-boot:run

pause
