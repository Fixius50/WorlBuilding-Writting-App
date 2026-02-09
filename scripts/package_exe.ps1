# Script de empaquetado para Chronos Atlas
# Requiere JDK 17+ instalado (Busca JDK 21+ automáticamente)

$appName = "ChronosAtlas"
$mainJar = "ChronosAtlas.jar"
$inputDir = "target"
$outputDir = "dist"
$version = "2.0.0"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Chronos Atlas - Packaging Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 0. Detectar Java/jpackage
$jpackagePath = "jpackage"
try {
    $null = Get-Command jpackage -ErrorAction Stop
}
catch {
    Write-Host "[INFO] jpackage no encontrado en PATH. Buscando Java..." -ForegroundColor Yellow
    $javaPath = (Get-Command java -ErrorAction SilentlyContinue).Source
    if ($javaPath) {
        # Intentar deducir JDK desde java.exe
        $jdkPath = $javaPath | Split-Path | Split-Path
        $candidate = Join-Path $jdkPath "bin\jpackage.exe"
        if (Test-Path $candidate) {
            $jpackagePath = $candidate
            Write-Host "[OK] Usando jpackage desde: $jpackagePath" -ForegroundColor Green
        }
    }
    
    # Si aun no se encuentra, intentar buscar en carpetas comunes
    if ($jpackagePath -eq "jpackage") {
        $pfiles = ${env:ProgramFiles}
        $jdkCandidate = Get-ChildItem "$pfiles\Java" -Directory | Where-Object { $_.Name -match "jdk-2[1-9]" } | Sort-Object Name -Descending | Select-Object -First 1
        if ($jdkCandidate) {
            $candidate = Join-Path $jdkCandidate.FullName "bin\jpackage.exe"
            if (Test-Path $candidate) {
                $jpackagePath = $candidate
                Write-Host "[OK] Usando jpackage detectado: $jpackagePath" -ForegroundColor Green
            }
        }
    }
}

# Verificar versión final
& $jpackagePath --version
if ($LASTEXITCODE -ne 0) {
    Write-Error "No se encontró jpackage (JDK 21+ requerido)."
    exit 1
}

# 1. Compilar Frontend
Write-Host "`n[1/5] Compilando Frontend (React)..." -ForegroundColor Yellow
& npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo al compilar Frontend."
    exit 1
}

# 2. Compilar Backend
Write-Host "`n[2/5] Compilando Backend (Maven)..." -ForegroundColor Yellow
& .\mvnw.cmd clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo al compilar Backend."
    exit 1
}

# 3. Limpiar salida anterior
if (Test-Path $outputDir) {
    Remove-Item -Recurse -Force $outputDir
}
New-Item -ItemType Directory -Path $outputDir | Out-Null

# 4. Empaquetar con jpackage
Write-Host "`n[3/5] Generando ejecutable nativo..." -ForegroundColor Yellow
& $jpackagePath `
    --type app-image `
    --dest $outputDir `
    --name $appName `
    --input $inputDir `
    --main-jar $mainJar `
    --vendor "WorldBuilding" `
    --app-version $version `
    --description "Grimorio Digital para Escritores"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo en jpackage."
    exit 1
}

# 5. Copiar Recursos Adicionales (DB, Docs, etc)
Write-Host "`n[4/5] Copiando recursos..." -ForegroundColor Yellow
$appDir = "$outputDir/$appName"

# Copiar carpeta db (data y migration) desde src/main/resources/db si existe
$dbSrc = "src/main/resources/db"
$dbDest = "$appDir/db"

if (Test-Path $dbSrc) {
    New-Item -ItemType Directory -Force -Path $dbDest | Out-Null
    Copy-Item -Recurse -Force "$dbSrc\*" $dbDest
    Write-Host "[OK] Carpetas DB copiadas" -ForegroundColor Gray
}
else {
    Write-Warning "Carpeta DB no encontrada en $dbSrc"
}

# Copiar Docs si existe
if (Test-Path "Docs") {
    $docsDest = "$appDir/Docs"
    New-Item -ItemType Directory -Force -Path $docsDest | Out-Null
    Copy-Item -Recurse -Force "Docs\*" $docsDest
    Write-Host "[OK] Docs copiados" -ForegroundColor Gray
}

# 6. Crear Script de Debug
Write-Host "`n[5/5] Creando script de debug..." -ForegroundColor Yellow
$debugScript = "$appDir/debug.bat"
"@echo off
echo Iniciando ChronosAtlas en modo debug (Consola Visible)...
title ChronosAtlas Debug Console
echo.
REM Usar el JRE embebido para ejecutar el JAR directamente
`"%~dp0runtime\bin\java.exe`" -jar `"%~dp0app\ChronosAtlas.jar`"
echo.
echo La aplicacion se ha cerrado. Revisa los errores arriba.
pause" | Out-File -FilePath $debugScript -Encoding ASCII

Write-Host "Script de debug creado: $debugScript" -ForegroundColor Gray

# 7. Crear ZIP final
Write-Host "`n[6/6] Creando archivo ZIP final..." -ForegroundColor Yellow
$zipName = "ChronosAtlas.zip"
if (Test-Path $zipName) { Remove-Item $zipName }

Compress-Archive -Path "$appDir" -DestinationPath $zipName -Force

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   EMPAQUETADO FINALIZADO" -ForegroundColor Green
Write-Host "   Archivo: $zipName" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
