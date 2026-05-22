# ARQUITECTURA DE WORKSPACES

El sistema utiliza un concepto de **Workspaces** para separar el contexto de trabajo del usuario.

## 1. SELECTOR DE ESPACIO (Home)

Donde el usuario selecciona el Universo o Proyecto en el que desea trabajar.

## 2. EL ARCHITECT PANEL

La vista principal que contiene:

- **Sidebar Izquierda:** Selector de módulos (Biblia, Mapas, Cronogramas, Conlangs).
- **Área Central:** El editor o visor activo.
- **Inspección Contextual por Feature:** Sin sidebar derecho global; cada módulo resuelve inspección mediante rutas, modales locales o paneles embebidos.

### Comportamiento de Navegación

1. El selector de espacio define el `projectId` activo.
2. El módulo seleccionado en sidebar determina la ruta base funcional.
3. Cada feature controla su propio estado de inspección contextual sin contenedor lateral global.

## 3. MÓDULOS ESPECIALIZADOS

### World Bible (La Biblioteca)

Organización jerárquica de carpetas y archivos. Uso de un editor Rich Text (Tiptap) personalizado.

### Chronos Atlas (Líneas Temporales)

Eje cronológico que permite visualizar eventos. Los eventos pueden pertenecer a múltiples líneas temporales (ej. Historia General vs Historia de un Personaje).

### Glyph Foundry (Linguística)

Herramienta para crear sistemas de escritura, fonética y diccionarios.

- Composer de palabras por reglas silábicas (CV/CVC).
- Motor de glifos con capas y soporte SVG para diseño visual.
- Exportación de fuentes compiladas `.ttf` para uso externo.

## FLUJO DE DATOS (Sandbox & OPFS)

La aplicación corre en un ecosistema híbrido disgregado (Vite Frontend / Java Backend). El flujo es:

1. **React UI (/frontend):** Capa de `presentation` que captura la entrada del usuario y orquesta la navegación por módulos.
2. **Capa de Aplicación (`/application`):** Los casos de uso (puros) orquestan la lógica de negocio sin conocer detalles técnicos de la UI.
3. **Capa de Infraestructura (`/infrastructure`):**
   - **SQLocal (`/localDB`):** Las consultas SQL se envían a un Web Worker que ejecuta la base de datos SQLite (WASM).
   - **API (`/api`):** Comunicación con el backend Java modular.
4. **Motor EAV (Entidades Dinámicas):**
   - Las definiciones de atributos se leen/escriben desde `plantillas`.
   - Los valores por entidad se persisten en `valores`.
   - La UI consume estos datos mediante casos de uso y renderiza formularios dinámicos por feature.
   - Componentes clave del flujo: Taller de arquetipos (gestión de plantillas), formularios dinámicos por entidad y gestor masivo tabular para edición rápida.
   - En lingüística, los datos de glifos y escritura se encapsulan en `contenido_json` (ej. `svgPathData`, `layers`) para persistencia local-first.
5. **Módulos de Expansión (Fase 5):**
   - Whiteboards, genealogías, calendarios fantásticos, sistemas de magia/religión y compilación editorial se integran como features sobre el mismo flujo local-first.
   - Cualquier colaboración P2P (WebRTC) opera como capa adicional de sincronización sobre datos locales, sin romper el modelo de persistencia base.
   - Flujo base de colaboración: generar código de invitación, conexión del coautor, sincronización silenciosa y resolución de conflictos por fusión asistida.
6. **OPFS:** Los cambios se persisten de forma binaria en el _Origin Private File System_ del navegador.
7. **Bridge (Opcional):** El Servidor Java en `/backend` (`syncService`), estructurado en dominios DDD, gestiona copias de seguridad y comunicación con el sistema de archivos real.

## REFERENCIAS CRUZADAS (ENRUTAMIENTO)

- Arquitectura técnica y APIs del sistema: `01_Estrategia_Tecnica.md`
- Lineamientos visuales de UI/UX: `02_Diseño_UI_UX.md`
- Priorización y cronología por fechas: `03_Roadmap_Vivo.md`
- Build y distribución: `00_Reglas_Maestras.md` (Sección 5)
