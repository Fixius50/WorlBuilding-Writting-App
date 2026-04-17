# GUÍA DE DISEÑO UI/UX - TECHNICAL ZEN (MONOLITHIC)

El objetivo es una interfaz que se sienta como un manuscrito de ingeniería cósmica: táctil, sólida, monolítica y de extrema precisión. Adiós al "plástico digital" y las transparencias.

## PALETA DE COLORES (SISTEMA DINÁMICO)

A partir de Marzo 2026, el sistema utiliza **Temas Dinámicos** basados en variables CSS (`:root`) y clases de Tailwind especializadas. **No utilizar colores HEX hardcoded** (`bg-[#...]`) en nuevos componentes.

*   **Variables Core:**
    *   `--background`: Color base del tema (ej. `240 10% 2%` para Deep Space).
    *   `--primary`: Color de acento para acciones (ej. `243 75% 59%`).
    *   `--foreground`: Color de texto principal.
*   **Temas Disponibles:**
    *   **Deep Space:** Oscuro profundo con acentos índigo.
    *   **Nebula:** Tonos violetas y púrpuras suaves.
    *   **High Contrast:** Blanco y negro puro para máxima legibilidad.

## TIPOGRAFÍA E ICONOGRAFÍA

El sistema permite la selección dinámica de fuentes en Ajustes, pero la jerarquía es estricta:
*   **Contraste Tipográfico (Technical Manuscript):** 'Cormorant Garamond' (Serif) para bloques de lectura largos, dando un aspecto de "documento oficial".
*   **Micro-Tipografía (Codex):** 'JetBrains Mono' o 'Space Mono' (en mayúsculas, con amplio `tracking`) para datos técnicos y etiquetas.
*   **UI Estructural:** 'Outfit' o 'Lexend' para encabezados limpios.
*   **Iconografía:** Google Material Symbols (Rounded) con peso ligero (Light/300) o sólido para indicar selección "tallada".

## NAVEGACIÓN Y ESTRUCTURA (THE ARCHITECT LAYOUT)

1.  **Sidebar Izquierdo (Control de Misión):**
    *   **Superior:** Navegación entre módulos (Dashboard, Biblia, Atlas, Cronología).
    *   **Inferior (Footer):** Acceso rápido a **Settings** y **Logout**. El diseño se ha simplificado eliminando iconos redundantes del header.
2.  **The Monolithic Box:** Contenedores con colores base sólidos (`bg-background` o variaciones muy sutiles de luminosidad).
    *   **Hairline Borders:** Bordes extremadamente finos (`border-white/5` o `border-black/10`) para definir paneles sin sombras pesadas.
    *   **Relieve Negativo:** Sombras interiores (`shadow-inner`) para simular paneles hundidos o tallados.
3.  **Interactividad Reactiva:** 
    *   Los cambios de Idioma y Tema se aplican al instante mediante el bus de eventos del sistema sin recargar la página.

*   **Prohibición de Estéticas Sci-Fi/Cyber:** Está terminantemente prohibido el diseño estilo "Pantalla de Hacker" o "Sistema Futurista" (referencias a "Datastream", "Buffer", letras hiper-espaciadas `tracking-[0.5em]`, barras interactivas falsas brillantes o colores neón fuera de la paleta controlada). Toda ventana debe sentirse como un panel de diseño técnico, atemporal, purista y académico (Technical Zen).

## ORGANIZACIÓN VISUAL (ATOMIC DESIGN)

La capa de presentación (`/presentation`) se rige estrictamente por Atomic Design:
1.  **Atoms:** Componentes base indivisibles (botones, inputs, iconos).
2.  **Molecules:** Uniones simples de átomos (ej. campo de búsqueda con icono).
3.  **Organisms:** Secciones complejas y autónomas (ej. el Architect Sidebar, el explorador de entidades).
4.  **Templates:** Layouts de página que definen la estructura sin datos reales.
5.  **Pages:** Vistas completas que inyectan datos de la capa de `application`.
