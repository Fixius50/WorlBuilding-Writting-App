# Guía de Pruebas para Agentes de IA (Worldbuilding App)

Esta guía está diseñada para que un modelo de IA pueda navegar, probar y entender la estructura actual de la aplicación **Chronos Atlas**.

## URL Base
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:8080` (API REST)

## 1. Navegación Principal
La aplicación utiliza un layout principal (`ArchitectLayout`) con una barra lateral izquierda colapsable.

- **Rutas Clave**:
    - `/` o `/:user/:project`: Dashboard Principal.
    - `.../bible`: **Biblia del Mundo** (Gestor de Carpetas y Entidades).
    - `.../map`: **Atlas** (Visor de Mapas - *En desarrollo*).
    - `.../map-editor/edit/:id`: **Editor de Mapas** (Pantalla completa).

## 2. Flujo de Trabajo: Biblia del Mundo (`/bible`)
Este es el núcleo de la organización.

1.  **Crear Carpeta**:
    - En la raíz o dentro de otra carpeta, usa el botón "Nueva Carpeta" o Clic Derecho -> "Nueva Carpeta".
    - Esto organiza tu lore jerárquicamente.
2.  **Menú Contextual (Clic Derecho)**:
    - Sobre una Carpeta: `Nueva Entidad`, `Nuevo Mapa`, `Nueva Timeline`, `Renombrar`, `Eliminar`.
    - Sobre un Archivo: `Renombrar`, `Eliminar`.

## 3. Flujo de Trabajo: Creación y Edición de Mapas
El sistema de mapas es una característica destacada y compleja.

### A. Crear un Mapa
1.  Navega a una carpeta en la `/bible`.
2.  Haz **Clic Derecho** en la carpeta -> Selecciona **"Nuevo Mapa"**.
3.  **Wizard de Creación**:
    - Se abrirá una pantalla de configuración por pasos.
    - Completa Nombre, Descripción, Tipo (Mundo/Regional) y selecciona una fuente (Imagen o Blanco).
    - Clic en "Create Map".

### B. Editor de Mapas (`MapEditor`)
Tras crear, serás redirigido al editor.
- **Panel Central (Lienzo)**: Muestra el mapa/imagen y la rejilla.
- **Panel Derecho (Ajustes)**:
    - **Identidad**: Cambia el nombre o tipo.
    - **Grid System**: Activa/Desactiva la rejilla y ajusta su tamaño con el slider.
    - **Canvas**: Ajusta las dimensiones (WxH) o sube una nueva imagen de fondo.
    *Nota: Este panel usa un diseño de Acordeón.*
- **Guardado**:
    - Botón "Save Changes" (arriba derecha).
    - **Importante**: Al guardar, el sistema te redirigirá automáticamente a la carpeta de la Biblia donde está el mapa.

## 4. Estructura Técnica Relevante
- **Backend (Spring Boot)**:
    - Entidades se guardan en `EntidadGenerica`.
    - Mapas son entidades con `tipoEspecial = 'map'`.
    - Los datos del mapa (grid, imagen, capas) se serializan en JSON dentro del campo `descripcion`.
- **Frontend (React/Vite)**:
    - `MapEditor.jsx`: Componente monolítico para la edición. Usa `useOutletContext` para comunicarse con el `ArchitectLayout` (Panel Derecho).

## 5. Pruebas Recomendadas
Si eres una IA probando la app, intenta:
1.  Crear una estructura de carpetas anidada (ej. `Reino -> Capital -> Castillo`).
2.  Crear un Mapa dentro de "Castillo".
3.  En el editor, sube una imagen de prueba y ajusta la rejilla para que coincida con la escala de la imagen.
4.  Guarda y verifica que vuelves a la carpeta "Castillo".
5.  Vuelve a entrar al mapa y confirma que la rejilla y la imagen se mantienen.
