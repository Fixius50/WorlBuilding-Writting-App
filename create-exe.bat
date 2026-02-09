@echo off
echo ========================================
echo  Creando ejecutable con jpackage
echo ========================================
echo.

set JAVA_HOME=C:\Program Files\Java\jdk-24
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/2] Verificando jpackage...
jpackage --version
if %errorlevel% neq 0 (
    echo [ERROR] jpackage no encontrado
    pause
    exit /b 1
)
echo.

echo [2/2] Creando ejecutable de Windows...
jpackage ^
    --input target ^
    --name ChronosAtlas ^
    --main-jar ChronosAtlas.jar ^
    --main-class com.worldbuilding.WorldbuildingAppV2Application ^
    --type app-image ^
    --dest dist ^
    --app-version 2.0.0 ^
    --vendor "WorldBuilding" ^
    --description "Aplicacion de worldbuilding - Chronos Atlas" ^
    --win-console

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo al crear el ejecutable
    pause
    exit /b 1
)

echo.
echo [OK] Ejecutable creado en: dist\ChronosAtlas
echo.
pause
