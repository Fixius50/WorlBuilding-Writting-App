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
    --main-class org.springframework.boot.loader.launch.JarLauncher `
    --vendor "Roberto Monedero" `
    --description "Grimorio Digital para Escritores"

if ($LASTEXITCODE -eq 0) {
    Write-Host "--- Empaquetado completado con éxito! ---" -ForegroundColor Green
    Write-Host "El ejecutable se encuentra en: $outputDir/$appName/$appName.exe" -ForegroundColor Gray
}
else {
    Write-Host "--- Error durante el empaquetado ---" -ForegroundColor Red
}
