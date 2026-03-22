# ARQUITECTURA DE WORKSPACES

El sistema utiliza un concepto de **Workspaces** para separar el contexto de trabajo del usuario.

## 1. SELECTOR DE ESPACIO (Home)

Donde el usuario selecciona el Universo o Proyecto en el que desea trabajar.

## 2. EL ARCHITECT PANEL

La vista principal que contiene:

* **Sidebar Izquierda:** Selector de módulos (Biblia, Mapas, Cronogramas, Conlangs).
* **Área Central:** El editor o visor activo.
* **Sidebar Derecha:** Panel de ayuda, notas rápidas y referencias.

## 3. MÓDULOS ESPECIALIZADOS

### World Bible (La Biblioteca)

Organización jerárquica de carpetas y archivos. Uso de un editor Rich Text (Tiptap) personalizado.

### Chronos Atlas (Líneas Temporales)

Eje cronológico que permite visualizar eventos. Los eventos pueden pertenecer a múltiples líneas temporales (ej. Historia General vs Historia de un Personaje).

### Glyph Foundry (Linguística)

Herramienta para crear sistemas de escritura, fonética y diccionarios.

## FLUJO DE DATOS (Sandbox & OPFS)

La aplicación corre en un entorno Web (Vite). El flujo es:
1. **React UI:** Captura la entrada del usuario.
2. **Servicios (TS):** `entityService`, `folderService`, etc., procesan la lógica.
3. **SQLocal (Worker):** Las consultas SQL se envían a un Web Worker que ejecuta la base de datos SQLite (WASM).
4. **OPFS:** Los cambios se persisten de forma binaria en el *Origin Private File System* del navegador.
5. **Bridge (Opcional):** El Servidor Java (`syncService`) entra en juego solo para "sacar" o "meter" el archivo `.sqlite` del sandbox del navegador al sistema de archivos real del usuario.
