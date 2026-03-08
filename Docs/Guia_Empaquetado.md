# Guía de Empaquetado y Distribución - Chronos Atlas

Este documento explica cómo generar el ejecutable final (`.exe`) para distribuir la aplicación nativa de Windows mediante **Electron Builder**.

## 1. Requisitos Previos

- **Windows 10/11**
- **Node.js** v20+

## 2. Generar el Paquete (Build)

Hemos transicionado de Java a un entorno puramente JavaScript/TypeScript nativo de escritorio.
El proceso de construcción y empaquetado se realiza a través de NPM.

### Pasos

1. Abrir una terminal en la raíz del proyecto (`/WorldbuildingApp`).
2. Generar los archivos estáticos de Vite y TypeScript ejecutando:

   ```powershell
   npm run build
   ```

3. *(Futuro)* Usar la herramienta de empaquetado final:

   ```powershell
   npm run dist
   ```

### ¿Qué ocurre bajo el capó?

1. **Vite Build**: Empaqueta tu UI de React y comprime tu CSS/JS.
2. **Electron TS**: Compila tu backend Node (`main.ts` y controladores de SQLite) a `.js`.
3. **Electron Builder**:
    - Genera un archivo asilado `.exe` (Installer o Portable).
    - Incrusta el motor Chromium y Node.js de forma indetectable.
    - Anexa tu base local `.sqlite` predeterminada.

## 3. Resultado Final

Al finalizar, la carpeta `dist` alojará:

- **Ejecutable**: `Chronos Atlas Setup.exe` (Instalador estándar).
- O una carpeta `win-unpacked` si se define para empaquetado portable.

## 4. Distribución

Simplemente entrega el archivo `.exe`.
El usuario ya no necesitará instalar Java ni abrir una consola CMD. Al hacer doble clic sobre el ejecutable transiluminado, se abrirá la interfaz gráfica `Chronos Atlas` de forma 100% nativa.
