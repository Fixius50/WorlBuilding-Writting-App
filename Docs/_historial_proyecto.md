# Chronos Atlas - Historial del Proyecto

## PROMPTS PRINCIPALES

### Prompt Inicial (12/12/2024)
**Usuario:** Transformar WorldbuildingApp (Java/Spring Boot) a "Chronos Atlas" - IDE Narrativo Local-First para Worldbuilding con causalidad temporal.

**Referencias proporcionadas:**
- Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
- PowerSync: https://www.powersync.com/
- MapLibre: https://maplibre.org/ 
- Deck.gl: https://deck.gl/
- Nebula.gl: https://nebula.gl/

### Especificación del Manifiesto "Chronos Atlas"
- **Versión:** 1.0.0 (Release Candidate)
- **Clasificación:** IDE Narrativo / Motor de Worldbuilding Temporal
- **Arquitectura:** Local-First, Serverless, Event-Sourced

**Filosofía de Diseño:**
1. Local-First: La base de datos vive en el navegador. Latencia 0ms.
2. Causalidad Profunda: Guardamos historia, no estados. "¿Cómo era esto hace 10 años?"
3. Agnosticismo de Datos: Todo es una Entidad (EAV Temporal).

---

## STACK TECNOLÓGICO ("THE GOD STACK")

### Núcleo (Core & Data)
- **Nube (Serverless):** Supabase (PostgreSQL)
- **Sincronización:** PowerSync (bidireccional Postgres ↔ SQLite)
- **Cliente Local:** SQLite (WASM) via sql.js

### Frontend & Renderizado
- **Framework:** Next.js 15 (React 19)
- **Estilizado:** Tailwind CSS + Shadcn/UI
- **Gestión de Estado:** Zustand (UI) + PowerSync Hooks (Datos)

### Motor de Mapas (Geospatial Engine)
- **Base:** MapLibre GL JS (tiles 8K+)
- **Visualización:** Deck.gl (WebGL para tokens)
- **Edición Vectorial:** Nebula.gl (CAD, polígonos)

### Motor de Texto
- **Editor:** TipTap (Headless) con @Menciones y Bloques de Lógica

---

## CÓDIGO CLAVE

### 1. Almacenamiento de Datos (Local-First SQLite)
**Archivo:** `src/lib/db/local-database.ts`

```typescript
// Inicialización SQL.js (SQLite WASM)
export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`
  });

  const savedData = localStorage.getItem('chronos_atlas_db');
  if (savedData) {
    const data = new Uint8Array(JSON.parse(savedData));
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
    db.run(LOCAL_SCHEMA);
  }
  return db;
}

// Guardar en localStorage
export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  localStorage.setItem('chronos_atlas_db', JSON.stringify(Array.from(data)));
}
```

### 2. Esquema EAV Temporal
**Archivo:** `supabase/migrations/001_initial_schema.sql`

```sql
-- 1. ENTITIES (El contenedor)
CREATE TABLE entities (
  id UUID PRIMARY KEY,
  type VARCHAR NOT NULL, -- 'actor', 'location', 'item', 'rule'
  project_id UUID NOT NULL
);

-- 2. TIMELINES (Realidades/Multiverso)
CREATE TABLE timelines (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  parent_id UUID REFERENCES timelines(id),
  is_divergent BOOLEAN DEFAULT FALSE
);

-- 3. FACTS (La verdad en el tiempo)
CREATE TABLE facts (
  id UUID PRIMARY KEY,
  entity_id UUID REFERENCES entities(id),
  attribute VARCHAR NOT NULL,
  value JSONB NOT NULL,
  valid_from_game_tick INTEGER,
  valid_until_game_tick INTEGER,
  timeline_id UUID REFERENCES timelines(id)
);

-- Consulta temporal
CREATE FUNCTION get_entity_state(p_entity_id UUID, p_timeline_id UUID, p_game_tick INTEGER)
RETURNS TABLE (attribute VARCHAR, value JSONB) AS $$
  SELECT DISTINCT ON (f.attribute) f.attribute, f.value
  FROM facts f
  WHERE f.entity_id = p_entity_id
    AND f.timeline_id = p_timeline_id
    AND f.valid_from_game_tick <= p_game_tick
    AND (f.valid_until_game_tick IS NULL OR f.valid_until_game_tick > p_game_tick)
  ORDER BY f.attribute, f.valid_from_game_tick DESC;
$$ LANGUAGE sql;
```

### 3. Estado Global de Timeline (Zustand)
**Archivo:** `src/lib/stores/useTimelineStore.ts`

```typescript
interface TimelineState {
  activeTimelineId: string | null;
  currentGameTick: number;
  isPlaying: boolean;
  
  setActiveTimeline: (id: string) => void;
  setGameTick: (tick: number) => void;
  isDivergent: () => boolean;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  activeTimelineId: null,
  currentGameTick: 0,
  setActiveTimeline: (id) => set({ activeTimelineId: id }),
  setGameTick: (tick) => set({ currentGameTick: tick }),
  isDivergent: () => get().getActiveTimeline()?.type !== 'canon',
}));
```

### 4. Componente WorldMap (MapLibre + Deck.gl)
**Archivo:** `src/components/world-map/WorldMap.tsx`

```typescript
// Inicialización MapLibre con tema oscuro
map.current = new maplibregl.Map({
  container: mapContainer.current,
  style: {
    version: 8,
    sources: {},
    layers: [{
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#0a0f1a' }
    }]
  },
  center: [0, 0],
  zoom: 2,
});
```

### 5. Editor con @Menciones (TipTap)
**Archivo:** `src/components/smart-editor/SmartEditor.tsx`

```typescript
Mention.configure({
  suggestion: {
    items: ({ query }) => {
      // Consulta SQLite local para autocompletado
      return entities.filter(e => 
        e.name.toLowerCase().includes(query.toLowerCase())
      );
    },
  },
})
```

---

## IAs UTILIZADAS
- Claude (Anthropic) - Arquitectura y planificación
- Gemini (Google) - Implementación de código

---

## ESTRUCTURA FINAL

```
📂 WorldbuildingApp/
├── 📄 _historial_proyecto.md
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 next.config.js
├── 📄 tailwind.config.js
├── 📂 _legacy/              # Código Java archivado
├── 📂 supabase/
│   └── 📂 migrations/
│       └── 📄 001_initial_schema.sql
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📄 layout.tsx
│   │   ├── 📄 page.tsx
│   │   └── 📄 globals.css
│   ├── 📂 components/
│   │   ├── 📂 world-map/
│   │   ├── 📂 smart-editor/
│   │   ├── 📂 time-controller/
│   │   ├── 📂 sidebar/
│   │   └── 📂 top-bar/
│   └── 📂 lib/
│       ├── 📂 db/
│       └── 📂 stores/
```

### UI Refactor (15/12/2024)
- **Cambio de Paradigma:** De "IDE Split-Screen" a "Focus Mode Multi-Page".
- **Views:**
    - `Map`: Full screen + Floating TimeBar.
    - `Chronicle`: Editor centrado.
    - `Database`: Entity Graph/Tree full page.
- **Componentes:**
    - `TopBar`: Navegación central.
    - `TimeBar`: Modo minimalista.


### Phase 3: Navegación y Arquitectura (18/12/2025)
- **Navegación:** Eliminación de Sidebar lateral. Nuevo Menú Radial Superior con animaciones CSS.
- **Backend:** Soporte Multi-Tenant (Tabla Proyecto vinculada a Usuario).
- **Seguridad:** Redurección forzada a Login en root.


### Phase 5: Migraci�n de Base de Datos (19/12/2025)
- **Motor de BD:** Migraci�n completa de H2 (Archivos) a SQLite (Single File data/worldbuilding.db).
- **Refactorizaci�n Backend:**
    - Eliminaci�n de DynamicDataSourceConfig (Complejidad innecesaria).
    - Reescritura de ProyectoController para usar JPA (CuadernoRepository).
    - Limpieza de BDController y dependencias H2.
- **Estabilidad:** Soluci�n a problemas de lock de base de datos y dead-processes.

