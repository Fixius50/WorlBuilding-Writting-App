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

## FLUJO DE DATOS

La información viaja de React hacia el Proceso Principal de Electron a través de canales seguros de comunicación (`IPC`). El Backend TypeScript que corre en Node recibe estos eventos y usa `better-sqlite3` / Prisma para persistir la información JSON o estructural en un único archivo de base de datos local seguro.
