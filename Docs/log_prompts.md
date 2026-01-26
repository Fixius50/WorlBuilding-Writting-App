# LOG PROMPTS

## [2026-01-25] Strict Multi-Tenancy Cleanup

- **Goal**: Remove all hardcoded fallbacks to "Prime World" or special treatment for "Default World".
- **Action**:
  - Modified `WorldBibleController.java` to strictly follow session.
  - Modified `EscrituraController.java` to remove `Default World` redirection.
  - Modified `TimelineController.java` to remove auto-creation of `Prime World` metadata.
  - Modified `DataInitializer.java` to stop context forcing on startup.
- **Status**: Completed. Projects are now isolated in their own SQLite files based on session name.

## [2026-01-26] Debugging Writing View (Error 500) & Schema Mismatch

- **Goal**: Fix 500 Internal Server Error when accessing `/escritura/cuaderno/{id}`.
- **Diagnosis**:
  - Backend logs revealed `SQLITE_ERROR: no such column: h1_0.deleted`.
  - The `Hoja`, `NotaRapida`, and `EntidadIndividual` entities introduced soft-delete fields (`deleted`, `deleted_date`) which were missing in existing SQLite databases because `spring.jpa.hibernate.ddl-auto=none` prevents automatic updates.
- **Action**:
  - Implemented schema fix in `MigrationService.java` to execute `ALTER TABLE` commands manually via `JdbcTemplate`.
  - Removed `@Transactional` from `runFullMigration` to ensure schema changes commit even if data migration logic (legacy character migration) encounters errors.
  - Triggered migration via `POST /api/migration/run`.
- **Status**: **PARTIALLY RESOLVED / VERIFICATION PENDING**.
  - Migration executed without critical failures in logs, but browser verification of Writing View initially showed persistence of "no such column" error.
  - Server required restarts to potentially unlock DB files or clear caches.
  - Next steps involve confirming if columns now strictly exist in the `.db` files and if the application can now read them without error.

## [2026-01-25] Project Conditions Formalization

- **Goal**: Document strict development rules (No self-healing, Global error control, Flat Hierarchy).
- **Action**: Created `04_Reglas_Strictas_Proyecto.md` and updated `01_Estrategia_y_Roadmap.md`.
- **Status**: Completed. Strict rules enforced across the codebase.

## [2026-01-25] Ultra-minimal Error Reporting

- **Goal**: Simplify error messages to show only numbers (status codes) and routes/actions, reducing terminal noise.
- **Action**:
  - Refactored `GlobalExceptionHandler.java` to return `{ "status": X, "path": "METHOD /uri" }`.
  - Created `UnauthorizedException` and `ResourceNotFoundException`.
  - Refactored `ProjectSessionInterceptor.java` and Controllers to remove verbose logs and throw typed exceptions.
- **Status**: Completed. Terminal now shows clean entries like `!!! [ERR] 401 GET /api/world-bible/folders`.

## [2026-01-25] Notebook Hover CRUD System

- **Goal**: Implement Edit/Delete actions for notebooks visible on hover.
- **Action**:
  - **Backend**: Added `PUT /api/escritura/cuaderno/{id}` to `EscrituraController`.
  - **Frontend**: Updated `NotebookGrid` to show actions on hover and handle interactions.
  - **Frontend**: Connected logic in `WritingView` to handle updates via API.
- **Status**: Completed. Users can now rename and delete notebooks directly from the dashboard card.

## [2026-01-25] Visual Bug Fixes (Timeline & Writing)

- **Goal**: Fix right panel auto-expanding in Timeline and Index persistence in Writing view.
- **Action**:
  - **TimelineView**: Removed `setRightOpen(true)` on mount to respect user preference.
  - **ArchitectLayout**: Refactored Right Panel Portal to persist in DOM (hidden) when collapsed, preventing Writing Index desync.

## [2026-01-25] Timeline & Project Atomic Fixes

- **Goal**: Resolve "Project p 404" (Empty DB) and "Timeline CRUD Failed" (SQL Column Mismatch).
- **Action**:
  - **Security/Strictness**: Reverted "Auto-Repair" in `ProyectoController` to comply with No-Self-Healing rule.
  - **Project Creation**: Refactored `ProjectDiscoveryService` to ensure ATOMIC creation. If seeding fails, the `.db` file is deleted (preventing zombie empty projects).
  - **Timeline CRUD**: Diagnosis showed `no such column: u1_0.cuaderno_id`. Fixed `Universo.java` mapping to use `proyecto_id` instead of `cuaderno_id` to match Flyway V1 schema.
- **Status**: Completed. Timeline creation verified after compilation. Zombie projects prevented by new atomic logic.

## [2026-01-25] Multiverse System & UI Polish

- **Goal**: Implement "Multiverse" hierarchy (Universe -> Timelines) and fix navigation context.
- **Action**:
  - **Backend**: Verified `UniversoController` and `LineaTiempo` entity mapping.
  - **Migration**: Added `V2__Add_Relacion.sql` to fix missing table usage.
  - **Frontend**: integrated `TimelineView` with Multiverse API. Created unified "3-Tab" layout (`Eventos`, `Anexos`, `Universo`).
  - **UI**: Added Dynamic Header Subtitle ("LÍNEA DE TIEMPO" + Name) and unified navigation logic to prevent context loss.
- **Status**: Completed. Verified via Stress Test V3 (Browser). Creation, Deletion and Navigation fully functional.

## [2026-01-25] Favorites Implementation

- **Goal**: Add "Favorites" section to Sidebar and allow toggling favorites in Context Menu.
- **Action**:
  - **Backend**: Added `favorite` boolean to Entity schema. Fixed `LazyInitializationException` by adding Transactional Service method.
  - **Backend Fix**: Fixed `SQLITE_ERROR` (missing `descripcion` column) by updating `V1__Initial_Schema.sql`.
  - **Frontend**: Integrated Favorites list in `WorldBibleView` and Context Menu action.
- **Status**: Completed. Verified via `verify_favorites.ps1` (API Test).

## [2026-01-26] Stabilization Phase (Entity Persistence & UX)

- **Goal**: Resolve critical 500 Errors during Save/Edit and fix broken navigation in Editor.
- **Action**:
  - **Backend**: Implemented `hydrateEntity` in Service to fix `LazyInitializationException` by deep-loading relationships (`valores`, `plantilla`, `carpeta`) before serialization.
  - **Frontend**: Updated `EntityBuilder.jsx` to use server-provided `carpeta` data for redirection fallback, enabling "Save and Continue" and "Save and Exit" to work reliably from any context (Search/Favorites).
  - **Frontend**: Fixed `Enter` key in `FolderItem` (Renaming) to prevent page reload.
- **Status**: Completed. Verified via Manual Testing (Create, Edit, Rename, Save & Continue).

## [2026-01-26] Graph Visualization Migration (Cytoscape)

- **Goal**: Migrate the graph visualization to Cytoscape.js for better performance and implement server-side graph data generation.
- **Action**:
  - **Backend**: Created `GET /api/world-bible/graph` and implemented `getGraphData` in `WorldBibleService` to build nodes and edges on the server.
  - **Frontend**: Refactored `GeneralGraphView.jsx` to consume the new endpoint and implement Cytoscape.js logic.
- **Status**: Completed. Verified via Browser. Nodes and layout are rendering correctly.
