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
