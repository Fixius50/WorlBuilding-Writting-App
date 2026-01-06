# Chronos Atlas: El IDE del Escritor (Rediseño "Next")

Chronos Atlas evoluciona hacia un entorno de trabajo aún más potente y flexible, donde la narrativa y el lore se integran de forma fluida a través de un diseño **Glassmorphism Oscuro** de alta fidelidad. El nuevo paradigma se basa en un espacio de trabajo modular de tres paneles flanqueado por una navegación tipo dock.

## 1. Biblia del Mundo (Panel Lateral Izquierdo)

### Estructura de Carpetas Personalizable
- **Propósito**: Sustituir las categorías fijas por una estructura de carpetas completamente personalizable, permitiendo una organización jerárquica y temática de tu lore.
- **Qué puedes hacer**:
    - **Crear Carpetas y Subcarpetas**: Un botón o un menú contextual (clic derecho) permite crear nuevas carpetas. Se pueden anidar para construir una estructura tan compleja como necesites (ej. "Personajes de Eldoria" dentro de "Eldoria").
    - **Nombrar Carpetas**: Asigna nombres descriptivos ("Lugares Importantes", "Deidades Antiguas").
    - **Definir Atributos por Defecto (en Carpeta)**: Al crear o editar una carpeta, puedes establecer atributos por defecto (ej. campo "Rango" para todos los personajes en la carpeta "Militares") que se aplicarán automáticamente a cualquier nueva entidad creada dentro.
    - **Arrastrar y Soltar**: Mueve libremente entidades y carpetas para reorganizar tu mundo.
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
