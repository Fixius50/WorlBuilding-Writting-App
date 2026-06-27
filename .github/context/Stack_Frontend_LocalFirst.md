# CONTEXTO: STACK FRONTEND (LOCAL-FIRST)

Directrices de ingeniería para el lado cliente. Consumido por el **[MOD-2] Arquitecto** y **[MOD-3] Auditor**.

## ⚙️ Tecnologías Core
- **Framework**: React 18/19 + Vite.
- **Lenguaje**: TypeScript.
- **Estado**: Zustand para estado global (Async Orchestration).
- **Estilos**: TailwindCSS.
- **Base de Datos**: SQLocal (SQLite compilado a WASM usando OPFS).

## 🛡️ Reglas de Implementación Frontend

### 1. Persistencia Inmediata y Síncrona
- **Local-First Real**: Las lecturas y escrituras hacia la base de datos se hacen directamente contra SQLite en el navegador a través de `sqlocal`.
- **Cero Red**: No existen `fetch()` ni llamadas REST para recuperar las entidades del usuario, a menos que sea a una API externa autorizada o al Backend Auxiliar para tareas muy específicas.

### 2. Gestión de Estado (Zustand)
- Minimizar el uso de `useState` para datos que requieran persistencia o acceso transversal.
- Los *Stores* de Zustand deben encargarse de la lógica de negocio pesada, manteniendo los componentes React "tontos" (presentacionales).

### 3. Tipado Estricto (Regla de Oro del Arquitecto)
- **Cero `any`**: Está absolutamente prohibido usar `any`. 
- **`unknown` y Type Guards**: Si un payload viene de la DB o JSON, debe tiparse como `unknown` y validarse antes de usarse, o castearse asumiendo el riesgo, pero preferentemente usando validación estructural.
- Las entidades (Personajes, Cuadernos) siempre deben ajustarse a la interfaz `Entidad` global de `database.ts`.

### 4. Rendimiento de Componentes Complejos
- El Grafo Relacional y el Editor Zen (Writing Hub) son críticos.
- Uso obligatorio de `useMemo` y `useCallback` en las funciones que calculen dimensiones espaciales, layouts de nodos o parseo de grandes bloques de texto para evitar re-renders destructivos.
