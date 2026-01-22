# Manifiesto del Proyecto: Chronos Atlas (WorldbuildingApp)

## 1. Visión y Propósito
**Chronos Atlas "Next"** es un entorno modular de construcción de mundos profesional. Abandonamos las categorías rígidas por un sistema de **Bible Bible Dinámica** basada en carpetas y un **Entity Builder Universal** que permite a los autores definir cada detalle de su mundo con flexibilidad total.

---

## 2. Estrategia Técnica
*   **Core:** Java Spring Boot (v2 Refactor).
*   **Frontend:** HTML5, CSS3 (Vanilla + Tailwind CSS), JavaScript. Estética **Dark Glassmorphism**.
*   **Base de Datos:** SQLite local. Portabilidad total mediante archivo `.db`.
*   **Arquitectura:** Modular y desacoplada, preparada para expansión a sincronización en la nube (PostgreSQL/Supabase).

---

## 3. Sistema de Diseño (UI Kit: "Arcane Void")
El diseño busca un equilibrio entre la claridad de un IDE moderno y la mística de un antiguo estudio de alquimia.

*   **Paleta de Colores:**
    - **Void Dark:** `#09090b` (Fondo profundo).
    - **Glass Border:** `rgba(255, 255, 255, 0.05)`.
    - **Accent Indigo:** `#6366f1` (Primario).
    - **Accent Emerald:** `#10b981` (Secundario).
    - **Parchment White:** `#fafafa` (Texto).
*   **Tipografía:**
    *   **UI/Sistemas:** `Outfit` / `Inter` (Sans-serif limpia).
    *   **Lectura/Escritura:** `Cormorant Garamond` / `Playfair Display` (Serif elegante para inmersión profunda).

---

## 4. Mapa de Funcionalidades (Roadmap & Status)

### A. Entorno Modular [COMPLETADO]
*   **3-Panel Layout**: Explorador jerárquico, Lienzo Central y Caja de Atributos.
*   **Navigation Dock**: Barra flotante inferior con desenfoque.

### B. Biblia del Mundo Dinámica [COMPLETADO]
*   **Carpetas Hierárquicas**: Organización libre de lore.
*   **Attribute Inheritance**: Las carpetas definen la estructura de las entidades hijas.

### C. Entity Builder [COMPLETADO]
*   **Drag & Drop**: Construcción de fichas mediante bloques de atributos.
*   **Pestañas Contextuales**: Mapas y Cronologías integradas directamente en las fichas.

---

## 5. Filosofía de Desarrollo
1.  **Cero Distracción:** El autor no debe abandonar el teclado. Los comandos y atajos de teclado son prioridad.
2.  **Contexto es Rey:** La información del mundo debe fluir hacia el texto, no al revés.
3.  **Local-First:** Tus datos son tuyos. La sincronización es una opción, no un requisito.

## Estado Actual (2026-01-07)
- [x] **Fase de Estabilidad Core**: Completada. Persistencia de datos asegurada y esquema multi-tenant funcional.
- [x] **Seguridad**: Configurada para desarrollo fluido (PermitAll) sin comprometer la activaciÃn de sesiones de proyecto.
- [x] **UI/UX Biblia**: Entity Builder optimizado con controles en cabecera y visualizaciÃn corregida.

# Plan Maestro de Migración de Stack Tecnológico (Worldbuilding)

Este documento define la evolución tecnológica de **WorldbuildingApp** para convertirse en un ecosistema profesional, escalable y flexible, adaptado a la arquitectura existente.

---

## 01. Estabilidad de Datos (Base de Datos)
**Decisión:** **Flyway** (Migraciones Versionadas).

*   **Problema Crítico**: `ddl-auto=create` borra los datos. `update` es impredecible con SQLite.
*   **Solución**: Flyway toma el control.
    *   **Configuración**: `spring.jpa.hibernate.ddl-auto=validate`. Hibernate solo verifica, no toca.
    *   **Migraciones**: Scripts SQL manuales en `src/main/resources/db/migration`.
    *   **Beneficio**: Historial exacto de cambios, cero riesgo de borrado accidental.

---

## 02. Arquitectura de Datos: Evolución Híbrida (JSON)
**Decisión:** Integrar Columna JSON en la Entidad Existente.

*   **Situación Actual**: Tienes `EntidadGenerica` conectada a `AtributoValor` (tabla separada). Esto es rígido y costoso (muchos JOINs).
*   **Estrategia de Adaptación**:
    *   **No borrar lo existente**: Mantener `EntidadGenerica` como base.
    *   **Evolución**: Añadir columna `attributes` (JSON) a `EntidadGenerica`.
    
    ```java
    // En EntidadGenerica.java
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "json_attributes", columnDefinition = "JSON")
    private Map<String, Object> attributes = new HashMap<>();
    ```
    
    *   **Resultado**: Las nuevas funcionalidades (ej: "Daño de Fuego", "Clima") se guardarán en este JSON. Lo antiguo (`AtributoValor`) puede coexistir o migrarse gradualmente, sin romper la app hoy.

---

## 03. Motor de Visualización (Grafos)
**Decisión:** **Cytoscape.js**.

*   **Objetivo**: Visualizar miles de nodos (`EntidadGenerica` convertida a Nodos de Grafo) con alto rendimiento.
*   **Implementación**: Componente React `GraphCanvas` que consume el JSON de entidades.

---

## 04. Editor de "Hojas" (Rich Text & Lore)
**Decisión:** **TipTap** (Headless Editor).

*   **Funcionalidad**: Sistema de menciones (`[[`) que busca en la tabla `entidad_generica` por ID/Slug, permitiendo renombres automáticos sin romper enlaces.

---

## 05. UI y Layout
**Decisión:** **Tailwind CSS** + **Shadcn/ui** + **React-Resizable-Panels**.
*   Para acomodar Mapa, Editor y Ficha en una sola vista flexible.

---

## 06. Gestión de Estado
*   **TanStack Query**: Caché inteligente para los datos de `EntidadGenerica`.
*   **Zustand**: Gestión de filtros globales de UI.

---

## 07. Despliegue (Desktop)
*   **Electron**: Empaquetar Spring Boot (`.jar`) + React en un ejecutable único (`.exe`) con JRE embebido.

---

## Próximos Pasos
🔴 **EN ESPERA DE ORDEN "YA"**
1. Configurar Flyway (Prioridad de Seguridad).
2. Añadir columna JSON a `EntidadGenerica`.
3. Comenzar migración Frontend (Cytoscape).
# Chronos Atlas: El IDE del Escritor (Rediseño "Next")

Chronos Atlas evoluciona hacia un entorno de trabajo aún más potente y flexible, donde la narrativa y el lore se integran de forma fluida a través de un diseño **Glassmorphism Oscuro** de alta fidelidad. El nuevo paradigma se basa en un espacio de trabajo modular de tres paneles flanqueado por una navegación tipo dock.

## 1. Biblia del Mundo (Panel Lateral Izquierdo)

### Estructura de Carpetas Personalizable
- **Propósito**: Sustituir las categorías fijas por una estructura de carpetas completamente personalizable, permitiendo una organización jerárquica y temática de tu lore.
- **Qué puedes hacer**:
    - **Crear Carpetas y Subcarpetas**: Un botón o un menú contextual (clic derecho) permite crear nuevas carpetas. Se pueden anidar para construir una estructura tan compleja como necesites (ej. "Personajes de Eldoria" dentro de "Eldoria").
    - **Nombrar Carpetas**: Asigna nombres descriptivos ("Lugares Importantes", "Deidades Antiguas").
    - **Arrastrar y Soltar**: Mueve libremente entidades y carpetas para reorganizar tu mundo.
    - **Atributos Globales**: Los atributos ahora se gestionan de forma global para todo el proyecto desde el `TemplateManager`, permitiendo reutilizar plantillas (ej. "Rango", "Clima") en cualquier entidad sin depender de su carpeta.
    - **Visualización**: Cada carpeta muestra iconos claros con acentos Indigo-500 al seleccionar.
- **Diseño**: Barra lateral translúcida con árbol de navegación expandible y menús contextuales para Renombrar, Eliminar o Añadir Atributos.

## 2. Constructor Universal de Fichas (Área Central)

### Lienzo Flexible y Arrastrar y Soltar Atributos
- **Propósito**: El área central se transforma en un lienzo dinámico para construir fichas de entidad únicas, adaptándose a las necesidades de cada elemento de tu mundo.
- **Qué puedes hacer**:
    - **Campos por Defecto**: Al crear una entidad, el lienzo se precarga automáticamente con los atributos definidos en la carpeta padre.
    - **Caja de Herramientas de Atributos**: El panel lateral derecho se transforma en una biblioteca de "cajas" de atributos arrastrables cuando el constructor está activo.
    - **Tipos de Atributos**:
        - **Texto Libre**: Para biografías descripciones extensas.
        - **Texto Corto**: Para nombres o títulos.
        - **Número**: Para edad, población, tamaño.
        - **Fecha/Hora**: Para eventos cronológicos precisos.
        - **Selector (Dropdown)**: Para listas predefinidas (ej. "Estado: Vivo/Muerto").
        - **Enlace a Entidad**: Para vincular personajes, lugares u objetos entre sí.
        - **Imagen/Multimedia**: Para retratos o arte conceptual.
        - **Booleano (Sí/No)**: Para propiedades simples.
        - **Tabla**: Para estadísticas, inventarios o datos estructurados.
        - **Mapa Embedido**: Vincula una sección del atlas directamente a la ficha.
        - **Línea de Tiempo Embedida**: Muestra una mini-cronología específica del elemento.
- **Configuración**: Cada caja de atributo permite renombrar etiquetas, establecer valores por defecto, marcarlos como obligatorios o añadir descripciones de ayuda.

## 3. Entidades Especializadas y Pestañas de Función

### Flujo en Dos Pasos (Post-Guardado)
- **Paso 1: Atributos Básicos**: Se definen los atributos generales y se cataloga la entidad (Personaje, Lugar, etc., o tipos especiales como **Línea de Tiempo**, **Zona/Mapa** o **Lenguaje**).
- **Paso 2: Pestañas de Funciones Especiales**: Al detectar un tipo especializado, el área central habilita pestañas superiores con herramientas específicas:
    - **Pestaña "Cronología"**: Cargará el interfaz del Módulo Cronológico Interconectado (para entidades tipo Línea de Tiempo).
    - **Pestaña "Cartografía"**: Cargará el Editor de Mapas y Herramientas de Dibujo (para para entidades tipo Zona/Mapa).
    - **Pestaña "Taller Lingüístico"**: Cargará las herramientas de Conlangs (Léxico, Gramática, Editor de Glifos) para entidades tipo Lenguaje.
- **Coherencia**: Siempre se puede volver a la pestaña **"Atributos"** para modificar la ficha base. El diseño mantiene el Glassmorphism con pestañas resaltadas en Indigo-500.

## 4. Unificación del Espacio de Trabajo

El nuevo paradigma unifica todas las pantallas clave bajo la estructura de tres paneles:
- **Explorador (Biblia)** a la izquierda.
- **Lienzo de Trabajo (Vistas Centrales)**:
    - **Ficha de Entidad**: Visualización y edición de atributos y contenido anidado.
    - **Editor Gráfico Versátil**: Lienzo vectorial para símbolos y logogramas.
    - **Gestión de Territorios**: Listado y gestión geopolítica de biomas y asentamientos.
    - **Mapa Interactivo**: Navegación y colocación de pines sobre el atlas.
    - **Visualización de Grafo**: Lienzo dinámico de relaciones entre entidades.
- **Contexto (Escritura/Atributos)** a la derecha.

---

### 5. Pantalla de Bienvenida a Nuevo Cuaderno
- **Propósito**: Guiar al usuario en la configuración inicial y ofrecer acceso rápido a acciones clave.
- **Diseño**:
    - **Central/Horizontal**: Título de bienvenida, mensajes motivadores y tarjetas de acción destacadas ("Añadir Primera Entidad", "Crear Primer Mapa", "Empezar a Escribir", "Ver Ideas Rápidas").
    - **Visualización**: Ocupa el área central manteniendo visibles los paneles laterales y la navegación superior. Estilo Glassmorphism Oscuro.

### 6. Creación y Edición de Mapas (Implementado)
- **Editor de Mapas (`MapEditor.jsx`)**:
    - **Panel Derecho Global**: Integrado con diseño de Acordeón de 3 secciones:
        1.  **Identidad**: Nombre, Tipo (Regional, Mundo, etc.).
        2.  **Sistema de Rejilla**: Toggle On/Off y Slider de tamaño (px).
        3.  **Lienzo**: Dimensiones (Ancho/Alto) y Subida de Imagen de Fondo.
    - **Sincronización**: Los cambios en el panel derecho se reflejan instantáneamente en el lienzo central.
    - **Flujo de Guardado**: Al guardar cambios, el sistema redirige automáticamente a la carpeta contenedora para facilitar el flujo de trabajo.

---

### Flujo de Ejemplo:
1. El usuario crea una carpeta "Cronologías Importantes".
2. Define como atributo por defecto de la carpeta el selector "Tipo de Era".
3. Crea la entidad "La Caída del Imperio de Eldoria" de tipo **Línea de Tiempo**.
4. Al guardar, el área central habilita la pestaña **"Cronología"**.
5. Al cambiar a ella, el usuario empieza a añadir eventos históricos directamente sobre la ficha de la entidad.

Este rediseño garantiza una flexibilidad total, permitiendo que cada autor estructure su mundo exactamente como su narrativa lo requiera.
# Tareas Pendientes y Roadmap (Guía para IA)

Este documento resume el estado actual del proyecto y las tareas críticas que deben abordarse en las próximas sesiones de desarrollo.

## Estado Actual
- **Editor de Mapas**: Funcional en estructura (Panel Derecho de Ajustes, Guardado) pero falta la interactividad real del Canvas.
- **Biblia**: Navegación por carpetas funcional, creación de entidades y mapas operativa.
- **Interfaz**: Migrada a un diseño de 3 paneles (Explorer, Canvas, Contexto).

## 1. Prioridad Alta: Editor de Mapas
El esqueleto está listo, pero falta el motor gráfico.
- [x] **Re-integrar Konva/Canvas**:
    - Actualmente `MapEditor.jsx` usa un `CanvasPlaceholder` (Corregido: ahora usa `Stage` y `Layer`).
    - Hay que descomentar y adaptar la lógica de `react-konva` (Stage, Layers, Transformers) que está comentada o fue simplificada.
    - Sincronizar el Canvas real con el `gridSize` y `bgImage` del panel derecho.
- [x] **Herramientas de Dibujo**:
    - Implementar lógica para las herramientas de la barra izquierda (Pincel, Figuras, Texto).
    - Conectar estas herramientas con el estado de Konva.

## 2. Refactorización del Constructor de Entidades (`EntityBuilder`)
El constructor actual es funcional pero necesita alinearse con el nuevo diseño de "Panel Derecho Global".
    - [x] Migrar Tabs al Panel Derecho (Completado).
- [x] **Mejoras en Identidad**:
    - [x] Añadir campo "Apariencia" (Texto rico o imagen).
    - [x] Permitir subir icono personalizado (Local Image) para la entidad.

## 3. Mejoras de "Calidad de Vida" (UX)
- [x] **Renombrar en Sidebar**: Añadir opción "Rename" al menú contextual del árbol lateral (Hecho).
- [x] **Breadcrumbs**: Implementar migas de pan en la vista de carpetas para mejorar la navegación profunda.
- [ ] **Favoritos**: Sección en el sidebar para acceso rápido a entidades frecuentes.

## 4. Refactorización Técnica y Backend (Desde TODOs) [COMPLETADO ESTA SESIÓN]
Tareas extraídas de `WorldBibleController.java`:
- [x] **Restaurar Explorador Lateral**: Limpiar el sidebar para mostrar solo estructura de carpetas relevante.
- [x] **Rutas de Creación Directa**: Implementar rutas como `/new/:type` para acceso rápido.
- [x] **Guardado Diferido (Post-draft)**: Permitir crear entidades en memoria y solo persistir al guardar (evitar basura en DB).
- [x] **Refactorización Flujo de Creación (Sin Prompts)**: Reemplazado todos los `window.prompt` por `InputModal` o edición en línea.
- [x] **Breadcrumbs**: Implementado en Backend (`FolderDetail`) y Frontend (`Breadcrumbs.jsx`).
- [x] **Herencia de Plantillas**: Completado mediante la implementación de **Atributos Globales**.

## 5. Implementación del Editor de Texto "Zen" (Nueva Fase)
Objetivo: Crear una zona de escritura limpia, minimalista y personalizada.
- [x] **Setup Inicial**: Se ha optado por **React-Quill** en lugar de Tiptap debido a estabilidad.
- [x] **Diseño "Zen" UI**: Implementado mediante CSS personalizado en `ZenEditor.jsx` (Dark Mode, bordes ocultos).
- [x] **Sistema de Menciones (@)**: Implementado en `ZenEditor.jsx` usando `quill-mention` y API de entidades.
- [x] **Toolbar**: Integrada toolbar estilo Google Docs (Snow theme) con overrides oscuros.

## Tareas Completadas Recientemente 
- [x] **Gestión de Plantillas Globales, UX EntityBuilder, Consistencia UI**.
- [x] **Corrección de Errores Críticos (Persistencia y Visualización)**.
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
# Investigación: Librerías de Editores de Texto (React)

## Objetivo
Identificar la mejor librería para crear una "Zona de Escritura" limpia, minimalista y altamente customizable ("Headless"), con soporte robusto para menciones (`@Personaje`).

---

## 1. Recomendación Principal: Tiptap
**Veredicto: LA MEJOR OPCIÓN**
Es un wrapper "headless" sobre ProseMirror. No trae estilos por defecto, lo que nos da control total sobre la UI ("Pixel Perfect").

*   **Ventajas:**
    *   **Headless:** Eres dueño del HTML y CSS. Ideal para el diseño "Zen" solicitado.
    *   **Extensión de Menciones:** Tiene una extensión oficial (`@tiptap/extension-mention`) muy potente y fácil de conectar con datos asíncronos (nuestra BBDD).
    *   **Contexto de React:** Renderiza los nodos como componentes de React, permitiendo interactividad real dentro del texto.
*   **Desventajas:**
    *   Requiere más trabajo inicial de CSS (tailwind) porque viene "desnudo".

---

## 2. Alternativas Analizadas

### A. Slate.js
**Veredicto: Potente pero compleja**
Es un framework de bajo nivel. Te da total libertad, pero tienes que construir *todo* desde cero, incluso el comportamiento básico del cursor a veces.
*   **Pros:** Flexibilidad infinita.
*   **Contras:** Curva de aprendizaje muy alta. Implementar menciones requiere mucho código boilerplate manual.

### B. Lexical (Meta/Facebook)
**Veredicto: Prometedora pero verde**
El sucesor de Draft.js. Muy rápido y ligero.
*   **Pros:** Rendimiento excelente, accesibilidad.
*   **Contras:** Ecosistema más joven que Tiptap/Slate. La documentación a veces es fragmentada.

### C. Quill / TinyMCE / CKEditor
**Veredicto: DESCARTADAS**
Son editores "con pilas incluidas". Vienen con barras de herramientas clásicas estilo Word y estilos difíciles de sobrescribir.
*   **Razón de descarte:** Van en contra del principio de "limpieza visual" y personalización total que buscas.

---

## Plan de Acción (Basado en Tiptap)
1.  Instalar `@tiptap/react` y `@tiptap/starter-kit`.
2.  Instalar `@tiptap/extension-mention` para las menciones.
3.  Usar `tippy.js` (o solución propia) para el menú flotante de sugerencias.
4.  Estilar todo con **Tailwind CSS** para integrarlo en el *Glassmorphism* de la app.
