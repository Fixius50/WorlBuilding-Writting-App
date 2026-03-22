# Guía de Desarrollo Diario (Electron + React Vite + SQLite WASM)

Esta guía explica el flujo de trabajo tras el pivot a la arquitectura **Local-First** 100% JavaScript/TypeScript.

## 1. Arrancar el Entorno de Desarrollo

Ya no se utiliza Tauri ni Rust. El stack se levanta directamente con Vite y Electron:

```bash
npm run dev
```

Este comando levanta:
1. **Frontend (Vite):** Servidor de desarrollo con Hot Module Replacement (HMR).
2. **Contenedor (Electron):** Abre la ventana nativa que carga el frontend de Vite.

## 2. Modificando la Interfaz y Lógica (TypeScript)

Todo el código vive ahora bajo `src/`.

- **UI:** Componentes React en `src/features/` y `src/components/`.
- **Persistencia:** Consultas directas a la base de datos vía `entityService.ts` utilizando `sqlocal` (SQLite WASM).
- **Tipado:** Es obligatorio usar **TypeScript** en modo estricto. No crear archivos `.js` o `.jsx` nuevos; usar siempre `.ts` o `.tsx`.

### Reactividad de Temas e Idioma
Para asegurar que los cambios de configuración se reflejen en toda la app sin recargar:
1. Utilizar el hook `useLanguage` para textos.
2. Si se modifica un ajuste global fuera de un contexto, disparar el evento:
   ```typescript
   window.dispatchEvent(new Event('storage_update'));
   ```
3. En componentes Layout, usar clases de Tailwind basadas en variables (ej. `bg-background`, `text-foreground`, `bg-primary/20`) en lugar de colores fijos.

## 3. Base de Datos (SQLite WASM)

La base de datos reside en el navegador (WebWorker) y persiste en el sistema de archivos del usuario mediante OPFS. 

- No necesitas un proceso de base de datos externo.
- Para cambios en el esquema, se deben aplicar migraciones en los servicios correspondientes (`entityService`, `projectService`, etc.).

## 4. Empaquetado de Producción

Para generar el ejecutable nativo (`.exe`):

```bash
npm run build
```

Esto generará los archivos distribuibles en la carpeta `dist/` o `release/`.
## 5. Entity Builder y Atributos Globales

Para garantizar la reutilización de datos entre diferentes proyectos y entidades:
- **Atributos Globales:** Al crear una plantilla en el sidebar, usar `project_id: 0`. Esto la hace visible para cualquier proyecto (`getByProject(id) OR project_id = 0`).
- **Sincronización de Guardado:** Al guardar una entidad nueva, el estado local `isCreation` debe pasar a `false` inmediatamente para permitir ediciones posteriores sin recargar.
- **Borrado Físico:** Es crítico llamar a `deleteValue` al eliminar atributos de una entidad para evitar datos huérfanos en SQLite.
