# LOG PROMPTS

## [2026-01-25] Strict Multi-Tenancy Cleanup

- **Goal**: Remove all hardcoded fallbacks to "Prime World" or special treatment for "Default World".
- **Action**:
  - Modified `WorldBibleController.java` to strictly follow session.
  - Modified `EscrituraController.java` to remove `Default World` redirection.
  - Modified `TimelineController.java` to remove auto-creation of `Prime World` metadata.
  - Modified `DataInitializer.java` to stop context forcing on startup.
- **Status**: Completed. Projects are now isolated in their own SQLite files based on session name.

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
