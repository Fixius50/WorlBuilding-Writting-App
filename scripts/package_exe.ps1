# Script de empaquetado para Chronos Atlas
# Requiere JDK 17+ instalado

$appName = "ChronosAtlas"
$mainJar = "ChronosAtlas.jar"
$inputDir = "target"
$outputDir = "dist"

Write-Host "--- Iniciando empaquetado de $appName ---" -ForegroundColor Cyan

# 1. Limpiar carpeta de salida
if (Test-Path $outputDir) {
    Remove-Item -Recurse -Force $outputDir
}
New-Item -ItemType Directory -Path $outputDir | Out-Null

# 2. Verificar existencia del JAR
if (-not (Test-Path "$inputDir/$mainJar")) {
    Write-Error "No se encontró $inputDir/$mainJar. Ejecuta .\mvnw.cmd package primero."
    exit 1
}

# 3. Ejecutar jpackage
# Nota: --type app-image genera una carpeta con el .exe y el JRE. 
# Si quieres un instalador .msi o .exe (setup), usa --type msi (requiere WiX Toolset).
Write-Host "Generando imagen de aplicación en $outputDir..." -ForegroundColor Yellow

& jpackage `
    --type app-image `
    --dest $outputDir `
    --name $appName `
    --input $inputDir `
    --main-jar $mainJar `
    --vendor "Roberto Monedero" `
    --description "Grimorio Digital para Escritores"

if ($LASTEXITCODE -eq 0) {
    Write-Host "--- Copiando documentación (Docs/) ---" -ForegroundColor Yellow
    $docsSrc = "Docs"
    $docsDest = "$outputDir/$appName/Docs"
    
    if (Test-Path $docsSrc) {
        Copy-Item -Recurse -Force $docsSrc $docsDest
        Write-Host "Docs copiados a $docsDest" -ForegroundColor Gray
    }
    else {
        Write-Error "No se encontró la carpeta Docs!"
    }

    Write-Host "--- Creando carpetas de datos vacías ---" -ForegroundColor Yellow
    $dataDest = "$outputDir/$appName/data"
    $migrationDest = "$outputDir/$appName/migration"
    $backupsDest = "$outputDir/$appName/backups"
    
    New-Item -ItemType Directory -Force -Path $dataDest | Out-Null
    New-Item -ItemType Directory -Force -Path $migrationDest | Out-Null
    New-Item -ItemType Directory -Force -Path $backupsDest | Out-Null
    
    Write-Host "Carpetas creadas: data, migration, backups" -ForegroundColor Gray

    Write-Host "--- Empaquetado completado con éxito! ---" -ForegroundColor Green
    Write-Host "El ejecutable se encuentra en: $outputDir/$appName/$appName.exe" -ForegroundColor Gray
}
else {
    Write-Host "--- Error durante el empaquetado ---" -ForegroundColor Red
}
