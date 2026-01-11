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

