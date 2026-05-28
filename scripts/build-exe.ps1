# ============================================================
# Chronos Atlas - Script de Rebuild y Compilación Portable
# Automatiza de forma dinámica la compilación y el empaquetado final
# ============================================================

$ErrorActionPreference = "Stop"

# --- Resolución dinámica de rutas basadas en la ubicación del script ---
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = (Get-Item "$scriptPath\..").FullName
$releasePath = "$rootPath\Release_App"
$backendPath = "$rootPath\backend"
$frontendPath = "$rootPath\frontend"

Write-Host "Ruta Raíz Detectada: $rootPath" -ForegroundColor Yellow

# --- 1. Cerrar procesos activos ---
Write-Host "`n--- [1/7] Cerrando procesos activos del sistema... ---" -ForegroundColor Cyan
$oldPreference = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
Get-Process -Name "Chronos Atlas" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
$ErrorActionPreference = $oldPreference
Start-Sleep -Seconds 3

# --- 2. Compilar Backend (Java con Maven) ---
Write-Host "`n--- [2/7] Compilando Backend (Java con Maven)... ---" -ForegroundColor Cyan
Set-Location $backendPath
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: La compilación de Maven en el backend ha fallado." -ForegroundColor Red
    exit 1
}

# --- 3. Compilar Frontend (Vite) ---
Write-Host "`n--- [3/7] Compilando Frontend (Vite)... ---" -ForegroundColor Cyan
Set-Location $frontendPath
if (Test-Path "$frontendPath\dist") {
    Remove-Item "$frontendPath\dist" -Recurse -Force
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: La compilación del frontend con Vite ha fallado." -ForegroundColor Red
    exit 1
}

# --- 4. Sincronizar archivos en Release_App ---
Write-Host "`n--- [4/7] Sincronizando artefactos compilados en Release_App... ---" -ForegroundColor Cyan

# Asegurar existencia del directorio de entrega
if (-not (Test-Path $releasePath)) {
    New-Item -ItemType Directory -Path $releasePath -Force
}

# Generar dinámicamente Instrucciones.txt
$instruccionesContent = @'
===========================================================
   WORLD BIBLE - MANUAL DE USO (VERSIÓN SILENCIOSA)
===========================================================

Esta versión es 100% PORTÁTIL y no requiere Java instalado.

INSTRUCCIONES DE USO:
1. Ejecuta el archivo "WorldBible.exe".
2. NO aparecerá ningún cuadro de diálogo. La aplicación es silenciosa.
3. Se abrirá automáticamente tu navegador web con la interfaz.
4. CONTROL: Busca un icono pequeño en la bandeja del sistema 
   (junto al reloj de Windows).
   - Haz clic derecho en el icono para abrir el menú.
   - Selecciona "Detener y Salir" para cerrar el servidor de fondo.

REQUISITOS DEL SISTEMA:
- Windows 10/11 (64 bits).

NOTAS IMPORTANTES:
- Si ves una pantalla blanca al inicio, espera unos segundos a que 
  el motor Java termine de arrancar.
- Tus proyectos se guardarán en la carpeta "projects".

===========================================================
   Documentación y Soporte: Guia_Usuario.html en dist/
===========================================================
'@
[System.IO.File]::WriteAllText("$releasePath\Instrucciones.txt", $instruccionesContent, [System.Text.Encoding]::UTF8)
Write-Host "  [OK] Instrucciones.txt generado con éxito." -ForegroundColor Green

# Copiar el JAR generado
Copy-Item "$backendPath\target\aux-server-1.0.0.jar" "$releasePath\app.jar" -Force
Write-Host "  [OK] app.jar sincronizado." -ForegroundColor Green

# Copiar el build del frontend
if (Test-Path "$releasePath\dist") {
    Remove-Item "$releasePath\dist" -Recurse -Force
}
New-Item -ItemType Directory -Path "$releasePath\dist" -Force
Copy-Item "$frontendPath\dist\*" "$releasePath\dist\" -Recurse -Force
Write-Host "  [OK] Frontend dist sincronizado en Release_App." -ForegroundColor Green

# --- 5. Crear launcher.js temporal ---
Write-Host "`n--- [5/7] Generando orquestador launcher.js y compilando binario nativo (pkg)... ---" -ForegroundColor Cyan
$launcherContent = @'
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const baseDir = path.dirname(process.execPath);
const jarPath = path.join(baseDir, 'app.jar');
const localJrePath = path.join(baseDir, 'jre', 'bin', 'java.exe');
const jrePath = fs.existsSync(localJrePath) ? localJrePath : 'java';
const APP_URL = 'http://localhost:8080/';

const javaProcess = spawn(jrePath, ['-jar', jarPath], {
  cwd: baseDir,
  detached: false,
  stdio: 'ignore',
  windowsHide: true,
});

setTimeout(() => {
  exec('start http://localhost:8080/');
}, 3500);

javaProcess.on('exit', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  if (javaProcess && !javaProcess.killed) {
    exec(`taskkill /F /PID ${javaProcess.pid} /T`, () => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
'@

[System.IO.File]::WriteAllText("$releasePath\launcher.js", $launcherContent, [System.Text.Encoding]::UTF8)
Write-Host "  [OK] launcher.js temporal escrito con éxito." -ForegroundColor Green

# Compilar launcher a ejecutable nativo usando pkg
Set-Location $rootPath
npx pkg "$releasePath\launcher.js" --targets node18-win-x64 --output "$releasePath\Chronos Atlas.exe"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: La compilación nativa con 'pkg' ha fallado." -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Chronos Atlas.exe compilado de forma nativa." -ForegroundColor Green

# --- 6. Aplicar Parche de Invisibilidad de Consola (PE Subsystem -> GUI) ---
Write-Host "`n--- [6/7] Aplicando parche PE para ocultación completa de consola MSDOS... ---" -ForegroundColor Cyan
$exePath = "$releasePath\Chronos Atlas.exe"
$bytes = [System.IO.File]::ReadAllBytes($exePath)
$peOffset = [System.BitConverter]::ToInt32($bytes, 0x3C)
$subsystemOffset = $peOffset + 4 + 20 + 68
$before = $bytes[$subsystemOffset]
$bytes[$subsystemOffset] = 2
[System.IO.File]::WriteAllBytes($exePath, $bytes)
Write-Host "  [OK] Subsistema de cabecera PE modificado con éxito (de $before a 2 - Windows GUI)." -ForegroundColor Green

# --- 7. Limpiar archivos temporales ---
Write-Host "`n--- [7/7] Saneamiento y limpieza de archivos temporales... ---" -ForegroundColor Cyan
if (Test-Path "$releasePath\launcher.js") {
    Remove-Item "$releasePath\launcher.js" -Force
}
Write-Host "  [OK] launcher.js temporal eliminado." -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "      PROCESO DE COMPILACION COMPLETADO CON EXITO" -ForegroundColor Green
Write-Host "  Ejecuta '$releasePath\Chronos Atlas.exe' para iniciar." -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Green
