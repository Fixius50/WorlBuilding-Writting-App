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
- **`src/components/`** — Componentes comunes reutilizables (Button, MonolithicPanel, ConfirmationModal…)
- **`src/database/`** — Servicios de persistencia (`entityService`, `folderService`, `projectService`…)
- **`src/types/`** — Interfaces TypeScript compartidas (`maps.ts`, etc.)
- **`src/context/`** — Contextos React (LanguageContext…)
- **`src/presentation/utils/`** — Utilidades visuales y mapeos de Atomic Design (iconos, colores).

**Reglas de código (Clean Code):**

- Todos los archivos nuevos deben ser `.ts` / `.tsx`. No crear `.js` / `.jsx`.
- **Sintaxis Reactiva:** Obligatorio utilizar exclusivamente **Arrow Functions** (`const Component = () => {}`). Queda terminantemente prohibida la palabra reservada `function`.
- **Flujo de Control Estricto:** Está prohibido el uso de _early returns_ dentro de condicionales (ej. `if (!x) return;`). Las lógicas deben estar envueltas en condicionales `if/else` completos para asegurar un punto de salida predecible.
- TypeScript en modo estricto. **Cero `any`.** Usar `unknown` para tipos dinámicos.
- Castear explícitamente valores `unknown` que vengan de `contenido_json` o index signatures.

---

## 2.1 Gestión de Jerarquías (DDD + Atomic)

Para añadir un nuevo tipo de entidad o categoría al sistema:

1. **Dominio:** Añade el ID y la descripción en `src/domain/models/hierarchy.ts`.
2. **Presentación:** Asocia el icono y color en `src/presentation/utils/hierarchyVisuals.ts`.
3. **Consumo:** Usa el hook/helper `getHierarchyVisuals(typeId)` en los componentes de Atomic Design.

---

---

## 3. Base de Datos (SQLite WASM)

La base de datos reside en el navegador (WebWorker) y persiste en OPFS.

- No se necesita un proceso externo de base de datos.
- Para cambios de esquema, aplicar migraciones en los servicios correspondientes.
- `project_id: 0` → atributos globales reutilizables en todos los proyectos.

---

## 4. Inspección Contextual (Sin Panel Derecho Global)

Desde mayo de 2026, el panel derecho global fue retirado de la arquitectura.

**Regla de Oro:** La inspección se resuelve por módulo usando rutas, modales locales o paneles embebidos en la vista activa.

### Patrones recomendados

```tsx
// 1) Navegación contextual por ruta
navigate(`/local/${projectName}/bible/entity/${entityId}`);

// 2) Modal local del módulo
setInspectorModalOpen(true);

// 3) Panel embebido en la propia vista
setSelectedItem(item);
```

---

## 5. Panel de Control Global (`ControlPanel`)

Es el hub central de herramientas de apoyo (drawer inferior).

- **Secciones:** Grafo (Red), Base de Datos (Datos), Notas Rápidas (Notas).
- **Toggle:** Botón flotante persistente en la parte inferior central.
- **Resize:** Soporta redimensionado manual. Para mayor fluidez, **no debe tener transiciones de altura** (animaciones CSS) durante el drag o toggle si se busca respuesta instantánea.
- **Base de Datos:** Incluye previsualización inline. Al seleccionar una entidad, se muestra el detalle dentro del mismo panel sin forzar navegación.

---

## 6. MapEditor — Patrones Clave

### Guardar un mapa (siempre incluir snapshotUrl)

```tsx
const baseImageLayer = layers.find(
  (l) => l.type === "image" && l.url && l.visible,
);
const snapshotUrl = baseImageLayer?.url || "";
const updatedContent = {
  ...currentContent,
  markers,
  layers,
  features,
  snapshotUrl,
  bgImage: snapshotUrl,
};
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
window.dispatchEvent(new Event("storage_update"));
```

Usar clases Tailwind basadas en variables (`bg-background`, `text-foreground`, `bg-primary/20`) en lugar de colores hex fijos.

---

## 9. Patrones de Estabilidad y Rendimiento (OBLIGATORIO)

Para evitar re-renders en cascada y asegurar que la UI sea fluida (especialmente en el Atlas y Grafo), se deben seguir estos patrones:

### A) Memoización de Contexto y Props

Cualquier objeto o array pasado a un Context.Provider o a un `Outlet context` debe estar envuelto en `useMemo`. Las funciones deben usar `useCallback`.

```tsx
const outletContextValue = useMemo(() => ({
  projectId,
  handleSave: useCallback((id, data) => { ... }, [projectId])
}), [projectId]);

return <Outlet context={outletContextValue} />;
```

### B) Estabilidad en Effects (Patrón de Refs)

Para llamar a funciones inestables dentro de un `useEffect` sin disparar re-renders infinitos, se deben asignar a una `ref` en el cuerpo del componente.

```tsx
const handlerRef = useRef(handler);
handlerRef.current = handler;

useEffect(() => {
  handlerRef.current();
}, []); // Sin dependencias molestas
```

### C) Prevención de Fugas de Datos

Al crear entidades, desestructurar `useParams` usando los nombres exactos de la ruta (`folderId`, `entityId`). Nunca asumir nombres como `folderSlug` si la ruta no los define así, ya que resultará en datos guardados en la raíz por error.

---

## 10. Producción

```bash
npm run build
```

Genera los archivos en `dist/`. El ejecutable nativo se empaqueta con el proceso descrito en `Guia_Empaquetado.md`.

---

## 11. Motor de Entidades Multiversal (EAV) — Patrones Clave

Implementado en mayo de 2026 para permitir una flexibilidad total en la definición de atributos.

### A) El Taller (ArchetypeManager)

- Permite crear `Plantilla` (atributos dinámicos).
- **Alcance**: Los atributos pueden ser **Globales** (aparecen en todas las entidades) o **Específicos** (solo para un tipo, ej: `PERSONAJE`).
- **Ubicación**: Accesible en `/workshop`.

### B) Fórmularios Dinámicos (DynamicAttributeForm)

- Se inyecta en la pestaña `METADATA` de `EntityProfile`.
- Carga las plantillas aplicables a la entidad y sus valores guardados.
- **Persistencia**: Los valores se guardan en la tabla `valores`. El guardado es automático (onChange).

### C) Gestor Masivo (BibleTableView)

- Utiliza `@tanstack/react-table`.
- **Ráfaga de Creación**: Fila superior para crear múltiples entidades rápidamente.
- **Scroll Horizontal**: La tabla debe estar envuelta en un contenedor con `overflow-x-auto` para respetar la barra lateral y no romper el layout.
