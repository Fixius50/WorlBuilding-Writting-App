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

La aplicación corre en un ecosistema híbrido disgregado (Vite Frontend / Java Backend). El flujo es:
1. **React UI (/frontend):** Capa de `presentation` que captura la entrada del usuario usando Atomic Design.
2. **Capa de Aplicación (`/application`):** Los casos de uso (puros) orquestan la lógica de negocio sin conocer detalles técnicos de la UI.
3. **Capa de Infraestructura (`/infrastructure`):**
   - **SQLocal (`/localDB`):** Las consultas SQL se envían a un Web Worker que ejecuta la base de datos SQLite (WASM).
   - **API (`/api`):** Comunicación con el backend Java modular.
4. **OPFS:** Los cambios se persisten de forma binaria en el *Origin Private File System* del navegador.
5. **Bridge (Opcional):** El Servidor Java en `/backend` (`syncService`), estructurado en dominios DDD, gestiona copias de seguridad y comunicación con el sistema de archivos real.
