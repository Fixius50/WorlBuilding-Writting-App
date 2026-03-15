# GUÍA DE DISEÑO UI/UX - DARK GLASSMORPHISM

El objetivo es una interfaz que se sienta como una herramienta de un arquitecto cósmico: elegante, profunda y técnica.

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

## TIPOGRAFÍA

El sistema permite la selección dinámica de fuentes en Ajustes:
*   **UI Moderna:** 'Lexend' o 'Outfit' (Sans-serif).
*   **Legendaria:** 'Cormorant Garamond' (Serif) para la Biblia.
*   **Codex:** 'JetBrains Mono' para datos técnicos.

## NAVEGACIÓN Y ESTRUCTURA (THE ARCHITECT LAYOUT)

1.  **Sidebar Izquierdo (Control de Misión):**
    *   **Superior:** Navegación entre módulos (Dashboard, Biblia, Atlas, Cronología).
    *   **Inferior (Footer):** Acceso rápido a **Settings** y **Logout**. El diseño se ha simplificado eliminando iconos redundantes del header.
2.  **The Architect Box:** Contenedores con `bg-background` y bordes sutiles.
3.  **Interactividad Reactiva:** 
    *   Los cambios de Idioma y Tema se aplican al instante mediante el bus de eventos del sistema sin recargar la página.

## ICONOGRAFÍA
Uso de **Google Material Symbols** (Rounded) con peso ligero (Light/300).
