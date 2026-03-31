# Guía de Desarrollo Diario — WorldbuildingApp

Esta guía explica el flujo de trabajo tras el pivot a la arquitectura **Local-First** 100% TypeScript.

## 1. Arrancar el Entorno de Desarrollo

```bash
# Opción A: Script de arranque
run-app.bat

# Opción B: Manual
npm run dev
```

El servidor Vite arranca en `http://localhost:5173`. Hot Module Replacement (HMR) activo.

---

## 2. Estructura de Código

Todo el código vive bajo `src/`:

- **`src/features/`** — Módulos por dominio (Maps, Entities, Linguistics, Timeline, Writing…)
- **`src/components/`** — Componentes comunes reutilizables (Button, GlassPanel, ConfirmationModal…)
- **`src/database/`** — Servicios de persistencia (`entityService`, `folderService`, `projectService`…)
- **`src/types/`** — Interfaces TypeScript compartidas (`maps.ts`, etc.)
- **`src/context/`** — Contextos React (LanguageContext…)

**Reglas de código:**
- Todos los archivos nuevos deben ser `.ts` / `.tsx`. No crear `.js` / `.jsx`.
- TypeScript en modo estricto. No usar `any` en nuevos módulos.
- Castear explícitamente valores `unknown` que vengan de `contenido_json` o index signatures.

---

## 3. Base de Datos (SQLite WASM)

La base de datos reside en el navegador (WebWorker) y persiste en OPFS.

- No se necesita un proceso externo de base de datos.
- Para cambios de esquema, aplicar migraciones en los servicios correspondientes.
- `project_id: 0` → atributos globales reutilizables en todos los proyectos.

---

## 4. Panel Derecho Global (`GlobalRightPanel`)

Hay **dos mecanismos** para inyectar contenido en el panel lateral derecho:

### A) Portal (recomendado para mapas y carpetas)
```tsx
const portalRef = document.getElementById('global-right-panel-portal');
// En JSX:
{portalRef && createPortal(<MiPanel />, portalRef)}
```
Llama a `setRightPanelTab('CONTEXT')` para activar la pestaña correcta.

### B) setRightPanelContent (para vistas que necesitan controlar toda la pestaña)
```tsx
const { setRightPanelContent } = useOutletContext<ArchitectContext>();
useEffect(() => {
  setRightPanelContent(<MiContenido />);
  // ⚠️ OBLIGATORIO: limpiar al desmontar para no bloquear el portal
  return () => setRightPanelContent(null);
}, [deps]);
```

**⚠️ Importante:** El key correcto de la pestaña de contexto es `'CONTEXT'` (inglés). Usar `'CONTEXTO'` no activará ninguna pestaña visible.

---

## 5. MapEditor — Patrones Clave

### Guardar un mapa (siempre incluir snapshotUrl)
```tsx
const baseImageLayer = layers.find(l => l.type === 'image' && l.url && l.visible);
const snapshotUrl = baseImageLayer?.url || '';
const updatedContent = { ...currentContent, markers, layers, features, snapshotUrl, bgImage: snapshotUrl };
```

### Vinculación de marcadores con entidades
El campo de vínculo en `MapMarker` es `entityId` (no `entidadId`).

### Modales dentro del MapEditor
Los modales deben estar **fuera** del componente `<Map>` de MapLibre para no interferir con los eventos del canvas.

---

## 6. FolderView — Nueva Creación

La tarjeta `+` en la vista de carpetas muestra un menú con tres opciones:
- **Entidad** → navega a `bible/folder/:id/entity/new/entidadindividual`
- **Mapa** → navega a `map-editor/create/:folderId`
- **Línea de Tiempo** → crea carpeta tipo `TIMELINE`

Las `BibleCard` de tipo `Map` navegan al Atlas (`/local/:project/map`), no al EntityRouter.

---

## 7. Reactividad de Temas e Idioma

```typescript
// Para actualizar tema/idioma sin recargar
window.dispatchEvent(new Event('storage_update'));
```

Usar clases Tailwind basadas en variables (`bg-background`, `text-foreground`, `bg-primary/20`) en lugar de colores hex fijos.

---

## 8. Producción

```bash
npm run build
```

Genera los archivos en `dist/`. El ejecutable nativo se empaqueta con el proceso descrito en `Guia_Empaquetado.md`.
