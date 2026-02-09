# Guía de Empaquetado y Distribución - Chronos Atlas

Este documento explica cómo generar el ejecutable final (.exe) y el archivo comprimido (.zip) para distribuir la aplicación.

## 1. Requisitos Previos

- **Windows 10/11**
- **Java JDK 21+** instalado (o `jpackage` en el PATH).
- **Node.js** (para compilar el frontend).

## 2. Generar el Paquete

Hemos automatizado todo el proceso en un único script de PowerShell.

### Pasos:

1. Abrir una terminal (PowerShell o CMD) en la raíz del proyecto.
2. Ejecutar el siguiente comando:

   ```powershell
   .\scripts\package_exe.ps1
   ```

### ¿Qué hace este script?

El script realiza las siguientes tareas automáticamente:

1.  **Compila Frontend**: Ejecuta `npm run build` para generar los archivos estáticos de React.
2.  **Compila Backend**: Ejecuta Maven (`mvn clean package`) para crear el JAR de Spring Boot.
3.  **Limpia**: Borra la carpeta `dist` anterior para evitar residuos.
4.  **Empaqueta con jpackage**:
    - Genera un ejecutable nativo (`ChronosAtlas.exe`).
    - Incluye un JRE embebido (para que el usuario final no necesite instalar Java).
    - Configura el ejecutable para correr en segundo plano (sin consola).
5.  **Copia Recursos**: Asegura que la base de datos (`db/data`) y migraciones estén presentes.
6.  **Crea Tools de Debug**: Genera `debug.bat` para facilitar la solución de problemas.
7.  **Comprime**: Crea el archivo `ChronosAtlas.zip` final.

## 3. Resultado Final

Al finalizar, encontrarás:

- **Archivo**: `ChronosAtlas.zip` en la raíz del proyecto.
- **Carpeta**: `dist/ChronosAtlas` (versión descomprimida).

## 4. Distribución

Simplemente envía el archivo `ChronosAtlas.zip`.

**Instrucciones para el usuario final:**
1. Descomprimir el ZIP.
2. Abrir la carpeta `ChronosAtlas`.
3. Doble clic en `ChronosAtlas.exe`.
   - La aplicación abrirá automáticamente el navegador en `http://localhost:3000`.
   - Si no abre, usar `debug.bat` para ver errores.
