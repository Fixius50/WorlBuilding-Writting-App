---
description: Eliminar componentes y configuración de Electron del proyecto React/Vite.
---
# Flujo de Trabajo: Desmantelamiento de Electron

Este Skill enseña al agente cómo limpiar un proyecto que abandona Electron para convertirse en una aplicación SPA/Web estándar.

## Pasos de Ejecución

1. **Modificar `package.json`**:
   - Eliminar dependencias: `electron`, `electron-builder`, `vite-plugin-electron`, `vite-plugin-electron-renderer`.
   - Limpiar bloque `"build"` si existe (ajustes de electron-builder).
   - Simplificar los `"scripts"`: solo `dev`, `build`, `preview` usando `vite` puro.

2. **Modificar `vite.config.ts`**:
   - Eliminar importaciones de `vite-plugin-electron` y `vite-plugin-electron-renderer`.
   - Eliminar dichos plugins del array `plugins: []`.

3. **Borrar Archivos del Sistema Operativo**:
   - Usar comando de sistema para eliminar las carpetas `src/electron/` y `dist-electron/` y `release/`.
   - Ignorar errores si no existen.
   
4. **Validación**:
   - Ejecutar el linter y verificar que no hay dependencias perdidas a módulos `electron` (como `require('electron')`) en todo el codebase.
