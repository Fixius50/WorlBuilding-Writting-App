# Visión del Proyecto
**WorldbuildingApp (Chronos Atlas)** es una herramienta de construcción de mundos "Local-First" diseñada por y para **ESCRITORES**.
Se aleja del enfoque "Gestión de Campaña de Rol (D&D)" para centrarse en la **Escritura Inmersiva**. Su objetivo es ser el "IDE del Escritor": un lugar donde narrar la historia y consultar la "biblia" del mundo están integrados en la misma pantalla.

# Estrategia Técnica (Serverless Java)
*   **Backend:** Java Spring Boot (v2 Refactor).
*   **Base de Datos:** **H2 Database (Archivo Local .mv.db)**. Portabilidad total sin instalaciones.
*   **Escalabilidad:** Arquitectura preparada para migrar a PostgreSQL/Supabase sin reescribir código.

# Mapa de Pantallas (UI/UX)
## 1. Pantalla de Escritura (CORE / Home)
El corazón de la aplicación sigue una jerarquía de **"Cuadernos Digitales"**:

### A. Estructura Jerárquica
1.  **Librería (Nivel 0):** Un espacio limpio donde crear "Cuadernos" (Proyectos).
    *   *Input:* Nombre y Propósito (Meta).
2.  **El Cuaderno (Nivel 1):** Vista de gestión de "Hojas".
    *   **Crear Hoja:** Modal selector de **Plantillas** (Inicio: solo "Vacía").
3.  **Lienzo de Escritura (Nivel 2):**
    *   **Paginación Visual:** Escritura dividida en hojas numeradas (no un scroll infinito).
    *   **Transición:** Al llenar una hoja, se crea/salta automáticamente a la siguiente, o manual mediante un botón [+].
    *   **Navegación:** Flechas para transicionar suavemente entre hojas.

### B. Herramientas de Escritura
*   **Editor Distraction-Free:** Texto rico minimalista.
*   **Sistema de Referencias Inteligentes (@):**
    *   **Autocompletado:** Al escribir `@`, despliega un menú contextual con entidades existentes Y la opción **"Crear Nueva Entidad"**.
    *   **Creación Flotante (Flow):** Si se elige "Crear", abre un **Modal Flotante** sobre el editor. Se rellena la ficha, se guarda, y se inserta la referencia automáticamente. **Nunca se abandona la pantalla de escritura.**
    *   **Hover & Gestión:** Al pasar el ratón por una referencia:
        *   Muestra resumen visual.
        *   **Acciones Rápidas:** Botones directos para **[Editar]** (abre modal) o **[Eliminar]**.
*   **Split View (Opcional):** Panel lateral colapsable para notas rápidas.

## 2. Gestor de Base de Datos ("La Biblia")
Interfaz para crear, leer y editar las entidades del mundo fuera del flujo de escritura.
*   **Listados:** Tablas filtrables de Personajes, Lugares, Objetos, Eventos.
*   **Fichas:** Formularios completos para rellenar metadatos.

## 3. El Atlas (Mapas)
*   Visor de mapas con pines interactivos.
*   Vinculación: Los pines del mapa llevan a las fichas de la base de datos.

## 4. Configuración (Low Prio)
*   Ajustes de tema (Dark/Light).
*   Gestión de backups locales.
*   *Login pospuesto.*

# Sistema de Diseño (The Alchemist's Study)
*   **Estilo:** "Academic & Antique Modern". Un equilibrio entre la claridad de una herramienta moderna y la calidez de un estudio de escritor clásico.
*   **Paleta de Colores:**
    *   **Papel (Claro):** `#fdfcfb` (Fondo), `#e2d1c3` (Bordes suaves).
    *   **Tinta (Oscuro):** `#1a1614` (Fondo deep), `#2c2420` (Tarjetas).
    *   **Acentos:** Oro Viejo (`#b8860b`), Esmeralda Profundo (`#064e3b`), Lacre (`#7f1d1d`).
*   **Tipografía:**
    *   **UI:** `Outfit` o `Inter` (Sans-serif limpia).
    *   **Escritura:** `Cormorant Garamond` o `Playfair Display` (Serif elegante para la inmersión).
*   **UX:** Efectos de "hoja de papel" física, sombras suaves y transiciones orgánicas.
