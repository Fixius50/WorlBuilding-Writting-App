# Manifiesto del Proyecto: Chronos Atlas (WorldbuildingApp)

## 1. Visión y Propósito

**Chronos Atlas "Next"** es un entorno modular de construcción de mundos profesional. Abandonamos las categorías rígidas por un sistema de **Bible Bible Dinámica** basada en carpetas y un **Entity Builder Universal** que permite a los autores definir cada detalle de su mundo con flexibilidad total.

---

## 2. Estrategia Técnica

* **Core:** Java Spring Boot (v2 Refactor).
* **Frontend:** HTML5, CSS3 (Vanilla + Tailwind CSS), JavaScript. Estética **Dark Glassmorphism**.
* **Base de Datos:** SQLite local. Portabilidad total mediante archivo `.db`.
* **Arquitectura:** Modular y desacoplada, preparada para expansión a sincronización en la nube (PostgreSQL/Supabase).

---

## 3. Sistema de Diseño (UI Kit: "Arcane Void")

El diseño busca un equilibrio entre la claridad de un IDE moderno y la mística de un antiguo estudio de alquimia.

* **Paleta de Colores:**
  * **Void Dark:** `#09090b` (Fondo profundo).
  * **Glass Border:** `rgba(255, 255, 255, 0.05)`.
  * **Accent Indigo:** `#6366f1` (Primario).
  * **Accent Emerald:** `#10b981` (Secundario).
  * **Parchment White:** `#fafafa` (Texto).
* **Tipografía:**
  * **UI/Sistemas:** `Outfit` / `Inter` (Sans-serif limpia).
  * **Lectura/Escritura:** `Cormorant Garamond` / `Playfair Display` (Serif elegante para inmersión profunda).

---

## 4. Mapa de Funcionalidades (Roadmap & Status)

### A. Entorno Modular [COMPLETADO]

* **3-Panel Layout**: Explorador jerárquico, Lienzo Central y Caja de Atributos.
* **Navigation Dock**: Barra flotante inferior con desenfoque.

### B. Biblia del Mundo Dinámica [COMPLETADO]

* **Carpetas Hierárquicas**: Organización libre de lore.
* **Attribute Inheritance**: Las carpetas definen la estructura de las entidades hijas.

### C. Entity Builder [COMPLETADO]

* **Drag & Drop**: Construcción de fichas mediante bloques de atributos.
* **Pestañas Contextuales**: Mapas y Cronologías integradas directamente en las fichas.

---

## 5. Filosofía de Desarrollo

1. **Cero Distracción:** El autor no debe abandonar el teclado. Los comandos y atajos de teclado son prioridad.
2. **Contexto es Rey:** La información del mundo debe fluir hacia el texto, no al revés.
3. **Local-First:** Tus datos son tuyos. La sincronización es una opción, no un requisito.

## 6. Mandamientos de Desarrollo (Strict Rules)

Estas reglas son absolutas y deben ser seguidas por cualquier IA o desarrollador en el proyecto. Ver detalle en [00_Reglas_Strictas_Proyecto.md](file:///c:/Users/rober/Desktop/Proyectos propios/WorldbuildingApp/Docs/00_Reglas_Strictas_Proyecto.md).

1. **Exposición Total de Errores**: Prohibido el "Self-Healing" que oculte fallos de datos.
2. **Jerarquía Plana**: Root -> Carpeta -> Entidad. Sin anidamiento excesivo.
3. **Contexto Explícito**: Prohibidos los fallbacks hardcoded; el proyecto debe estar activo en sesión.
4. **Backend Limpio**: Errores centralizados y respuestas libres de ruido técnico.

## Estado Actual (2026-01-07)

* [x] **Fase de Estabilidad Core**: Completada. Persistencia de datos asegurada y esquema multi-tenant funcional.

* [x] **Seguridad**: Configurada para desarrollo fluido (PermitAll) sin comprometer la activación de sesiones de proyecto.
* [x] **UI/UX Biblia**: Entity Builder optimizado con controles en cabecera y visualización corregida.

## Estado Actual (2026-01-26)

* [x] **Estabilidad Crítica Backend**: Solucionado el problema de `LazyInitializationException` mediante hidratación profunda en `WorldBibleService`.
* [x] **Robustez Navegación**: El `EntityBuilder` ahora maneja correctamente la redirección post-guardado incluso si se pierde el contexto de la URL (fallback a `entity.carpeta`).
* [x] **UX Edición**: Implementado flujo "Guardar y Continuar" y "Guardar y Salir" sin errores 500.

## Estado Actual (2026-01-26) - Sesión Flyway

* [x] **Seguridad de Datos**: Implementada migración de base de datos con **Flyway**.
  * Solucionado conflicto de versiones con `flyway-database-sqlite` usando drivers nativos.
  * Verificada migración correcta en múltiples proyectos (`FavTestFinal.db`, etc.).

# Plan Maestro de Migración de Stack Tecnológico (Worldbuilding)

Este documento define la evolución tecnológica de **WorldbuildingApp** para convertirse en un ecosistema profesional, escalable y flexible, adaptado a la arquitectura existente.

---

## 01. Estabilidad de Datos (Base de Datos)

**Decisión:** **Flyway** (Migraciones Versionadas).

* **Problema Crítico**:
    1. `ddl-auto=create` borra los datos.
    2. La configuración automática de Spring Boot solo migra la DB principal, ignorando los proyectos de usuario (`Users/ProjectA.db`).
* **Solución**: Flyway Orquestado (Multi-Tenant).
  * **Implementación**: Bean personalizado `DatabaseMigration.java`.
  * **Lógica**: Al inicio, escanea *todos* los archivos `.db` en la carpeta de datos.
  * **Resiliencia**: Ejecuta `flyway.repair()` antes de `migrate()` para auto-corregir checksums en desarrollo.
  * **Configuración**: `spring.flyway.enabled=false` (para evitar conflictos con el automigrador).
  * **Beneficio**: Historial exacto y soporte total para N bases de datos dinámicas.

---

## 02. Arquitectura de Datos: Evolución Híbrida (JSON)

**Decisión:** Integrar Columna JSON en la Entidad Existente.

* **Situación Actual**: Tienes `EntidadGenerica` conectada a `AtributoValor` (tabla separada). Esto es rígido y costoso (muchos JOINs).
* **Estrategia de Adaptación**:
  * **No borrar lo existente**: Mantener `EntidadGenerica` como base.
  * **Evolución**: Añadir columna `attributes` (JSON) a `EntidadGenerica`.

    ```java
    // En EntidadGenerica.java
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "json_attributes", columnDefinition = "JSON")
    private Map<String, Object> attributes = new HashMap<>();
    ```

  * **Resultado**: Las nuevas funcionalidades (ej: "Daño de Fuego", "Clima") se guardarán en este JSON. Lo antiguo (`AtributoValor`) puede coexistir o migrarse gradualmente, sin romper la app hoy.

---

## 03. Motor de Visualización (Grafos)

**Decisión:** **Cytoscape.js**.

* **Objetivo**: Visualizar miles de nodos (`EntidadGenerica` convertida a Nodos de Grafo) con alto rendimiento.
* **Implementación**: Componente React `GraphCanvas` que consume el JSON de entidades.

---

## 04. Editor de "Hojas" (Rich Text & Lore)

**Decisión:** **TipTap** (Headless Editor).

* **Funcionalidad**: Sistema de menciones (`[[`) que busca en la tabla `entidad_generica` por ID/Slug, permitiendo renombres automáticos sin romper enlaces.

---

## 05. UI y Layout

**Decisión:** **Tailwind CSS** + **Shadcn/ui** + **React-Resizable-Panels**.

* Para acomodar Mapa, Editor y Ficha en una sola vista flexible.

---

## 06. Gestión de Estado

* **TanStack Query**: Caché inteligente para los datos de `EntidadGenerica`.
* **Zustand**: Gestión de filtros globales de UI.

---

## 07. Despliegue (Desktop)

* **Electron**: Empaquetar Spring Boot (`.jar`) + React en un ejecutable único (`.exe`) con JRE embebido.

---

## Próximos Pasos

🔴 **EN ESPERA DE ORDEN "YA"**

1. [x] Configurar Flyway (Prioridad de Seguridad).
2. Añadir columna JSON a `EntidadGenerica`.
3. Comenzar migración Frontend (Cytoscape).

# Chronos Atlas: El IDE del Escritor (Rediseño "Next")

Chronos Atlas evoluciona hacia un entorno de trabajo aún más potente y flexible, donde la narrativa y el lore se integran de forma fluida a través de un diseño **Glassmorphism Oscuro** de alta fidelidad. El nuevo paradigma se basa en un espacio de trabajo modular de tres paneles flanqueado por una navegación tipo dock.

## 1. Biblia del Mundo (Panel Lateral Izquierdo)

### Estructura de Carpetas Personalizable

* **Propósito**: Sustituir las categorías fijas por una estructura de carpetas completamente personalizable, permitiendo una organización jerárquica y temática de tu lore.

* **Qué puedes hacer**:
  * **Crear Carpetas y Subcarpetas**: Un botón o un menú contextual (clic derecho) permite crear nuevas carpetas. Se pueden anidar para construir una estructura tan compleja como necesites (ej. "Personajes de Eldoria" dentro de "Eldoria").
  * **Nombrar Carpetas**: Asigna nombres descriptivos ("Lugares Importantes", "Deidades Antiguas").
  * **Arrastrar y Soltar**: Mueve libremente entidades y carpetas para reorganizar tu mundo.
  * **Atributos Globales**: Los atributos ahora se gestionan de forma global para todo el proyecto desde el `TemplateManager`, permitiendo reutilizar plantillas (ej. "Rango", "Clima") en cualquier entidad sin depender de su carpeta.
  * **Visualización**: Cada carpeta muestra iconos claros con acentos Indigo-500 al seleccionar.
* **Diseño**: Barra lateral translúcida con árbol de navegación expandible y menús contextuales para Renombrar, Eliminar o Añadir Atributos.

## 2. Constructor Universal de Fichas (Área Central)

### Lienzo Flexible y Arrastrar y Soltar Atributos

* **Propósito**: El área central se transforma en un lienzo dinámico para construir fichas de entidad únicas, adaptándose a las necesidades de cada elemento de tu mundo.

* **Qué puedes hacer**:
  * **Campos por Defecto**: Al crear una entidad, el lienzo se precarga automáticamente con los atributos definidos en la carpeta padre.
  * **Caja de Herramientas de Atributos**: El panel lateral derecho se transforma en una biblioteca de "cajas" de atributos arrastrables cuando el constructor está activo.
  * **Tipos de Atributos**:
    * **Texto Libre**: Para biografías descripciones extensas.
    * **Texto Corto**: Para nombres o títulos.
    * **Número**: Para edad, población, tamaño.
    * **Fecha/Hora**: Para eventos cronológicos precisos.
    * **Selector (Dropdown)**: Para listas predefinidas (ej. "Estado: Vivo/Muerto").
    * **Enlace a Entidad**: Para vincular personajes, lugares u objetos entre sí.
    * **Imagen/Multimedia**: Para retratos o arte conceptual.
    * **Booleano (Sí/No)**: Para propiedades simples.
    * **Tabla**: Para estadísticas, inventarios o datos estructurados.
    * **Mapa Embedido**: Vincula una sección del atlas directamente a la ficha.
    * **Línea de Tiempo Embedida**: Muestra una mini-cronología específica del elemento.
* **Configuración**: Cada caja de atributo permite renombrar etiquetas, establecer valores por defecto, marcarlos como obligatorios o añadir descripciones de ayuda.

## 3. Entidades Especializadas y Pestañas de Función

### Flujo en Dos Pasos (Post-Guardado)

* **Paso 1: Atributos Básicos**: Se definen los atributos generales y se cataloga la entidad (Personaje, Lugar, etc., o tipos especiales como **Línea de Tiempo**, **Zona/Mapa** o **Lenguaje**).

* **Paso 2: Pestañas de Funciones Especiales**: Al detectar un tipo especializado, el área central habilita pestañas superiores con herramientas específicas:
  * **Pestaña "Cronología"**: Cargará el interfaz del Módulo Cronológico Interconectado (para entidades tipo Línea de Tiempo).
  * **Pestaña "Cartografía"**: Cargará el Editor de Mapas y Herramientas de Dibujo (para para entidades tipo Zona/Mapa).
  * **Pestaña "Taller Lingüístico"**: Cargará las herramientas de Conlangs (Léxico, Gramática, Editor de Glifos) para entidades tipo Lenguaje.
* **Coherencia**: Siempre se puede volver a la pestaña **"Atributos"** para modificar la ficha base. El diseño mantiene el Glassmorphism con pestañas resaltadas en Indigo-500.

## 4. Unificación del Espacio de Trabajo

El nuevo paradigma unifica todas las pantallas clave bajo la estructura de tres paneles:

* **Explorador (Biblia)** a la izquierda.
* **Lienzo de Trabajo (Vistas Centrales)**:
  * **Ficha de Entidad**: Visualización y edición de atributos y contenido anidado.
  * **Editor Gráfico Versátil**: Lienzo vectorial para símbolos y logogramas.
  * **Gestión de Territorios**: Listado y gestión geopolítica de biomas y asentamientos.
  * **Mapa Interactivo**: Navegación y colocación de pines sobre el atlas.
  * **Visualización de Grafo**: Lienzo dinámico de relaciones entre entidades.
* **Contexto (Escritura/Atributos)** a la derecha.

---

### 5. Pantalla de Bienvenida a Nuevo Cuaderno

* **Propósito**: Guiar al usuario en la configuración inicial y ofrecer acceso rápido a acciones clave.

* **Diseño**:
  * **Central/Horizontal**: Título de bienvenida, mensajes motivadores y tarjetas de acción destacadas ("Añadir Primera Entidad", "Crear Primer Mapa", "Empezar a Escribir", "Ver Ideas Rápidas").
  * **Visualización**: Ocupa el área central manteniendo visibles los paneles laterales y la navegación superior. Estilo Glassmorphism Oscuro.

### 6. Creación y Edición de Mapas (Implementado)

* **Editor de Mapas (`MapEditor.jsx`)**:
  * **Panel Derecho Global**: Integrado con diseño de Acordeón de 3 secciones:
        1. **Identidad**: Nombre, Tipo (Regional, Mundo, etc.).
        2. **Sistema de Rejilla**: Toggle On/Off y Slider de tamaño (px).
        3. **Lienzo**: Dimensiones (Ancho/Alto) y Subida de Imagen de Fondo.
  * **Sincronización**: Los cambios en el panel derecho se reflejan instantáneamente en el lienzo central.
  * **Flujo de Guardado**: Al guardar cambios, el sistema redirige automáticamente a la carpeta contenedora para facilitar el flujo de trabajo.

---

### Flujo de Ejemplo

1. El usuario crea una carpeta "Cronologías Importantes".
2. Define como atributo por defecto de la carpeta el selector "Tipo de Era".
3. Crea la entidad "La Caída del Imperio de Eldoria" de tipo **Línea de Tiempo**.
4. Al guardar, el área central habilita la pestaña **"Cronología"**.
5. Al cambiar a ella, el usuario empieza a añadir eventos históricos directamente sobre la ficha de la entidad.

Este rediseño garantiza una flexibilidad total, permitiendo que cada autor estructure su mundo exactamente como su narrativa lo requiera.

# Tareas Pendientes y Roadmap (Guía Técnica)

## 1. Prioridad Alta: Editor de Mapas (Motor Gráfico)

* **Estado**: Motor Konva Implementado.
* **Pendiente**: Refinar usabilidad (Bug de selección/deselección) y verificar persistencia JSON compleja.
* Conectar el Frontend con la columa `json_attributes` real.

## 2. Migración Tecnológica

* Actualizar a Spring Boot 4 (Última Versión).
* Finalizar migración de visualización de Grafos (Cytoscape).

## 3. Deuda Técnica

* Refactorizar `WorkspaceSelector` para eliminar datos simulados.
