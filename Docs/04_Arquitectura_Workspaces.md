# ARQUITECTURA DE WORKSPACES

El sistema utiliza un concepto de **Workspaces** para separar el contexto de trabajo del usuario.

## 1. SELECTOR DE ESPACIO (Home)
Donde el usuario selecciona el Universo o Proyecto en el que desea trabajar.

## 2. EL ARCHITECT PANEL
La vista principal que contiene:
*   **Sidebar Izquierda:** Selector de módulos (Biblia, Mapas, Cronogramas, Conlangs).
*   **Área Central:** El editor o visor activo.
*   **Sidebar Derecha:** Panel de ayuda, notas rápidas y referencias.

## 3. MÓDULOS ESPECIALIZADOS

### World Bible (La Biblioteca)
Organización jerárquica de carpetas y archivos. Uso de un editor Rich Text (Tiptap) personalizado.

### Chronos Atlas (Líneas Temporales)
Eje cronológico que permite visualizar eventos. Los eventos pueden pertenecer a múltiples líneas temporales (ej. Historia General vs Historia de un Personaje).

### Glyph Foundry (Linguística)
Herramienta para crear sistemas de escritura, fonética y diccionarios.

## FLUJO DE DATOS
La información se guarda mediante el `BDController` que actúa como mediador para persistir archivos JSON o registros en H2 según la importancia.
