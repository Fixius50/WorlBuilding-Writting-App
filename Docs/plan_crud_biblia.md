# Restauración del Sistema CRUD en Carpetas (Biblia)

El objetivo es permitir la gestión completa (Crear, Editar, Renombrar, Eliminar, Mover) de las entidades y carpetas directamente desde la vista de cuadrícula de `FolderView`, no solo desde el explorador lateral.

## Cambios Propuestos

### Componente: BibleCard
- [MODIFY] [BibleCard.tsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/features/WorldBible/components/BibleCard.tsx)
    - Añadir soporte para `onRename` y `onMove`.
    - Implementar un botón de "Opciones" (tres puntos) que abra un menú contextual similar al de `FolderItem`.
    - Mejorar el feedback visual durante el hover para mostrar estas acciones.

### Componente: EntityBuilder
- [x] [MODIFY] [EntityBuilder.tsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/features/Entities/pages/EntityBuilder.tsx)
    - Implementación de variables CSS y unidades relativas.
    - Rediseño de header en dos niveles (Identidad superior, Acciones inferior).
    - Centrado de elementos y navegación por pestañas.
- [x] [MODIFY] [entityService.ts](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/database/entityService.ts)
    - Implementación de `getValues` para carga de atributos.
    - Sincronización de guardado/actualización de valores.

### Componente: FolderView
- [x] [MODIFY] [FolderView.tsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/features/Entities/pages/FolderView.tsx)
    - Simplificación de menús contextuales y flujos de creación.
    - Implementar lógica de renombrado de entidades.
    - Conectar las props de `BibleCard` con las funciones de `entityService` y `folderService`.

## Plan de Verificación

### Pruebas de Sistema
- [x] Verificar centrado del header en `EntityBuilder`.
- [x] Validar que el botón de guardado persiste los atributos en la DB.
- [x] Comprobar consistencia visual en temas Claro, Oscuro y Nebula.
- [x] Asegurar que el botón "Volver" retorna al proyecto/carpeta correcto.
