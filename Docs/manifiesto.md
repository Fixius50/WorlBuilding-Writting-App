# Manifiesto del Proyecto: Chronos Atlas (WorldbuildingApp)

## 1. Visión y Propósito
**Chronos Atlas** es una herramienta profesional de construcción de mundos (Worldbuilding) diseñada específicamente para **ESCRITORES**. A diferencia de los gestores de campañas de rol tradicionales, Chronos Atlas prioriza la **Escritura Inmersiva** y el flujo creativo sin fricciones.

Es una aplicación **"Local-First"**, garantizando privacidad, velocidad y soporte offline real, permitiendo que el universo del autor crezca de forma segura en su propia máquina.

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
    *   **Void Dark:** `#0B0C15` (Fondo de aplicación).
    *   **Glass Panel:** Transparencias con desenfoque (backdrop-blur) y bordes sutiles.
    *   **Accent Primary:** `#6366f1` (Indigo - Interacción principal) y `#10b981` (Esmeralda - Acentos narrativos).
    *   **Text Primary:** `#E0D4B4` (Parchment - Lectura optimizada).
*   **Tipografía:**
    *   **UI/Sistemas:** `Outfit` / `Inter` (Sans-serif limpia).
    *   **Lectura/Escritura:** `Cormorant Garamond` / `Playfair Display` (Serif elegante para inmersión profunda).

---

## 4. Mapa de Funcionalidades (Roadmap & Status)

### A. Escritura Inmersiva [IMPLEMENTADO]
*   **Lienzo Premium:** Paginación visual (hojas físicas) en lugar de scroll infinito.
*   **Header de Estadísticas:** Conteo de palabras y tiempo de lectura en tiempo real.
*   **Menciones Inteligentes (@):** Autocompletado vinculado a la Biblia del Mundo para invocar o crear entidades sin salir del texto.
*   **Panel de Notas Rápidas:** Sidebar lateral para capturar ráfagas de Lore o ideas al vuelo.
*   **Barra Flotante:** Herramientas de formato minimalistas que aparecen solo cuando se necesitan.

### B. Biblia del Mundo (Base de Datos) [IMPLEMENTADO]
*   **Gestión de Entidades:** Fichas detalladas para Personajes, Lugares, Objetos y Organizaciones.
*   **Vistas Duales:** Alternancia entre Vista de Lista (densidad) y Vista de Cuadrícula (visual).
*   **Nodos de Causalidad:** Vinculación lógica entre entidades y eventos históricos.

### C. El Atlas & Cronología [EN DESARROLLO]
*   **Atlas Geográfico:** Visor de mapas con pines interactivos conectados a la Biblia.
*   **Línea de Tiempo:** Visualización horizontal de la historia del mundo.

---

## 5. Filosofía de Desarrollo
1.  **Cero Distracción:** El autor no debe abandonar el teclado. Los comandos y atajos de teclado son prioridad.
2.  **Contexto es Rey:** La información del mundo debe fluir hacia el texto, no al revés.
3.  **Local-First:** Tus datos son tuyos. La sincronización es una opción, no un requisito.
