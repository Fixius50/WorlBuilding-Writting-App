# GUÍA DE DISEÑO UI/UX - TECHNICAL ZEN (MONOLITHIC)

El objetivo es una interfaz que se sienta como un manuscrito de ingeniería cósmica: táctil, sólida, monolítica y de extrema precisión. Adiós al "plástico digital" y las transparencias arbitrarias.

## PALETA DE COLORES (SISTEMA DINÁMICO)

A partir de Marzo 2026, el sistema utiliza **Temas Dinámicos** basados en variables CSS (`:root`) y clases de Tailwind especializadas. Evitar colores HEX hardcoded (`bg-[#...]`) en nuevos componentes, salvo casos excepcionales documentados.

- **Variables Core:**
  - `--background`: Color base del tema (ej. `240 10% 2%` para Deep Space).
  - `--primary`: Color de acento para acciones (ej. `243 75% 59%`).
  - `--foreground`: Color de texto principal.
- **Variables de Capas (Zen):**
  - Uso obligatorio de `foreground/X` para opacidades semánticas (ej. `bg-foreground/5` para hover, `border-foreground/10` para bordes).

## TIPOGRAFÍA E ICONOGRAFÍA

El sistema permite la selección dinámica de fuentes en Ajustes, pero la jerarquía es estricta:

- **Contraste Tipográfico (Technical Manuscript):** 'Cormorant Garamond' (Serif) para bloques de lectura largos.
- **Micro-Tipografía (Codex):** 'JetBrains Mono' o 'Space Mono' (en mayúsculas, con amplio `tracking`) para datos técnicos.
- **UI Estructural:** 'Outfit' o 'Lexend' para encabezados limpios.
- **Iconografía:** Google Material Symbols (Rounded) con peso ligero (Light/300) o sólido para indicar selección "tallada".

## NAVEGACIÓN Y ESTRUCTURA (THE ARCHITECT LAYOUT)

1. **Sidebar Izquierdo (Control de Misión):**
   - **Superior:** Navegación entre módulos.
   - **Inferior (Footer):** Acceso rápido a **Settings**. El diseño se ha simplificado eliminando iconos redundantes del header.
2. **The Monolithic Box:** Contenedores con colores base sólidos (`bg-background`).
   - **Hairline Borders:** Bordes extremadamente finos (`border-foreground/10`) para definir paneles sin sombras pesadas.
   - **Relieve Negativo:** Sombras interiores (`shadow-inner`) para simular paneles hundidos o tallados.
3. **Inspección Contextual por Feature:**
   - No existe panel derecho global. El contexto se presenta por rutas, modales locales o paneles embebidos según el módulo.
   - Mantener consistencia visual en títulos, jerarquía tipográfica y acciones de cierre/retorno.
4. **Paneles Laterales Colapsables Contextuales (Estilo VS Code):**
   - Para maximizar el área de visualización y dibujo en interfaces inmersivas, se priorizan las barras de actividad verticales estrechas (`w-[48px]`).
   - Los botones de estas barras no contienen etiquetas de texto directo; en su lugar, utilizan tooltips flotantes en español basados en hover (CSS puro).
   - Los paneles de contenido correspondientes flotan de manera adyacente y son colapsables haciendo clic sobre el icono activo o el botón de cerrar.

## ORGANIZACIÓN VISUAL (FEATURE-FIRST)

La UI se organiza por feature y no por una carpeta global de presentación.

1. **UI Transversal:** Vive en `src/features/Shared/ui`.
2. **UI de Dominio:** Vive en `src/features/<Feature>/components`.
3. **Vistas de Ruta:** Viven en `src/features/<Feature>/pages`.
4. **Hooks de Componente Reutilizables:** Viven en `src/features/<Feature>/hooks`.
5. **Hooks de uso único de pantalla:** Permanecen colocalizados en `pages`.

Dentro de `Shared/ui` se usa organización por intención visual:

1. `primitives`
2. `navigation`
3. `modals`
4. `panels`
5. `feedback`
6. `visuals`

Se mantienen archivos puente en `Shared/ui` para compatibilidad de imports (`@components/ui/*`).

## REFERENCIAS CRUZADAS (ENRUTAMIENTO)

- Reglas técnicas y arquitectura base: `01_Estrategia_Tecnica.md`
- Gobernanza documental y precedencia: `00_Reglas_Maestras.md`
- Build y empaquetado: `00_Reglas_Maestras.md` (Sección 5)
