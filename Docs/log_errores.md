# LOG DE ERRORES Y SOLUCIONES — WorldbuildingApp

Registro de errores resueltos para evitar regresiones y acelerar debugging futuro.

---

## 2026-03-31 — Sesión MapEditor Multicapa

### ❌ Error: `StyleSpecification.version` tipo number vs 8
**Archivo:** `MapEditor.tsx`
**Mensaje:** `El tipo 'number' no se puede asignar al tipo '8'`
**Causa:** MapLibre exige `version: 8 as const` en el objeto de estilo.
**Fix:**
```tsx
const mapStyle = useMemo(() => ({
  version: 8 as const,
  sources: {},
  layers: [{ id: 'bg', type: 'background' as const, paint: { 'background-color': mapBgColor } }]
}), [mapBgColor]);
```

---

### ❌ Error: Panel del editor muestra botones del viewer (sin función)
**Causa:** `InteractiveMapView` inyecta su UI vía `setRightPanelContent()`. Al cambiar de `viewer → editor`, ese estado no se limpiaba, tapando el `global-right-panel-portal` que usa el MapEditor.
**Fix:**
1. `InteractiveMapView` llama `setRightPanelContent(null)` en el return de su `useEffect` (destructor).
2. `MapEditor` llama `setRightPanelContent(null)` al montar para limpiar cualquier residuo.

---

### ❌ Error: Tras guardar un mapa nuevo, redirige al EntityEditor en lugar del Atlas
**Causa:** `MapRouter.onSave` tenía `navigate('/local/${projectName}/entities/Map/${newMapId}')` que cae en el `EntityRouter` genérico sin case para 'map'.
**Fix:** `onSave` ahora solo hace `setView('manager')`. Nunca navega a rutas externas.

---

### ❌ Error: MapManager no muestra miniatura del mapa
**Causa:** `getPreview()` busca `snapshotUrl` / `bgImage` en `contenido_json`, pero `MapEditor.handleSave` no los incluía.
**Fix:** `handleSave` extrae la URL de la primera capa imagen visible y la persiste como `snapshotUrl` y `bgImage`.

---

### ❌ Error: Panel de contexto desaparece al seleccionar mapa en MapManager
**Causa 1:** `setRightPanelTab('CONTEXTO')` — key en español que no coincide con ninguna pestaña del `GlobalRightPanel` (que usa `'CONTEXT'`).
**Causa 2:** El `useEffect` que abría el panel solo se disparaba cuando `selectedMapId` cambiaba, no al montar.
**Fix:** Unificar a `'CONTEXT'` en todo el proyecto. Añadir `useEffect(() => { setRightOpen(true); setRightPanelTab('CONTEXT'); }, [])` en MapManager.

---

### ❌ Error: `toLowerCase` no existe en tipo `unknown`
**Archivo:** `InteractiveMapView.tsx:44`
**Causa:** `MapAttributes` tiene `[key: string]: unknown`. Los campos no tipados explícitamente como `string` son `unknown`.
**Fix:** Cast explícito:
```tsx
let mapImage = (mapAttributes.bgImage || mapAttributes.snapshotUrl || null) as string | null;
```

---

### ❌ Error: `entidadId` no existe en tipo `MapMarker`
**Archivo:** `InteractiveMapView.tsx`
**Causa:** El campo correcto en `MapMarker` es `entityId`, no `entidadId`.
**Fix:** Renombrar todas las referencias a `selectedMarker.entityId`.

---

### ❌ Error: `unknown` no asignable a `number` (imageWidth/imageHeight)
**Archivo:** `InteractiveMapView.tsx`
**Causa:** Misma raíz que el error de `toLowerCase` — index signature `unknown`.
**Fix:**
```tsx
const imageWidth = (mapAttributes.imageWidth as number) || 1920;
const imageHeight = (mapAttributes.imageHeight as number) || 1080;
```

---

## Errores Históricos (Pre-2026-03-31)

### ❌ Error: `can't access property "value", p2 is null` (2026-02-21)
**Componente:** `GeneralGraphView` / `react-cytoscapejs`
**Causa:** `cytoscape` intenta parsear estilos CSS antes de que el DOM esté listo.
**Estado:** Resuelto migrando a `@xyflow/react`.

---

---

## 2026-04-01 — Sesión Estabilidad y Persistencia

### ❌ Error: Entidades nuevas no aparecen en la carpeta destino
**Archivo:** `EntityBuilder.tsx`, `EntityProfile.tsx`
**Causa:** Discrepancia en `useParams`. La ruta utiliza `:folderId` y `:entityId`, pero los componentes intentaban extraer `folderSlug` y `entitySlug`. Esto causaba que `carpeta_id` fuera `null` (Raíz) por defecto.
**Fix:** Sincronizar `useParams` con la definición de las rutas en `App.tsx` para usar `folderId` y `entityId`.

---

### ❌ Error: Re-renders infinitos o bloqueos de UI en Atlas/Grafo
**Causa:** Funciones o valores de contexto inyectados sin `useMemo` o `useCallback`, provocando una cascada de actualizaciones en el layout global.
**Fix:** Implementar memoización obligatoria para todos los objetos de contexto y usar el patrón de `useRef` para capturar handlers estables dentro de `useEffect`.

---

## Patrones de Prevención

| Patrón | Regla |
|--------|-------|
| `useParams` | Verificar `App.tsx` para usar el nombre exacto (`folderId`, `entityId`) |
| `useMemo / useCallback` | **OBLIGATORIO** para cualquier objeto de contexto o prop pesada |
| `useRef (Handlers)` | Usar para inyectar funciones de contexto en `useEffect` sin dependencias volátiles |
| `contenido_json` | Siempre castear: `as string`, `as number`, `as string \| null` |
| Panel derecho | Usar key `'CONTEXT'` (inglés) para `setRightPanelTab` |
| `setRightPanelContent` | Siempre devolver `() => setRightPanelContent(null)` en el destructor |
| Modales en MapEditor | Siempre fuera del componente `<Map>` |
| `MapMarker.entityId` | Campo correcto: `entityId` (no `entidadId`) |
| `snapshotUrl` | Siempre incluir en `handleSave` del MapEditor |