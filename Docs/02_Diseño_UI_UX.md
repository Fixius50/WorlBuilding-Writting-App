# GUÍA DE DISEÑO UI/UX - TECHNICAL ZEN (MONOLITHIC)

El objetivo es una interfaz que se sienta como un manuscrito de ingeniería cósmica: táctil, sólida, monolítica y de extrema precisión. Adiós al "plástico digital" y las transparencias arbitrarias.

## PALETA DE COLORES (SISTEMA DINÁMICO)

A partir de Marzo 2026, el sistema utiliza **Temas Dinámicos** basados en variables CSS (`:root`) y clases de Tailwind especializadas. **No utilizar colores HEX hardcoded** (`bg-[#...]`) en nuevos componentes.

* **Variables Core:**
  * `--background`: Color base del tema (ej. `240 10% 2%` para Deep Space).
  * `--primary`: Color de acento para acciones (ej. `243 75% 59%`).
  * `--foreground`: Color de texto principal.
* **Variables de Capas (Zen):**
  * Uso obligatorio de `foreground/X` para opacidades semánticas (ej. `bg-foreground/5` para hover, `border-foreground/10` para bordes).

## TIPOGRAFÍA E ICONOGRAFÍA

El sistema permite la selección dinámica de fuentes en Ajustes, pero la jerarquía es estricta:

* **Contraste Tipográfico (Technical Manuscript):** 'Cormorant Garamond' (Serif) para bloques de lectura largos.
* **Micro-Tipografía (Codex):** 'JetBrains Mono' o 'Space Mono' (en mayúsculas, con amplio `tracking`) para datos técnicos.
* **UI Estructural:** 'Outfit' o 'Lexend' para encabezados limpios.
* **Iconografía:** Google Material Symbols (Rounded) con peso ligero (Light/300) o sólido para indicar selección "tallada".

## NAVEGACIÓN Y ESTRUCTURA (THE ARCHITECT LAYOUT)

1. **Sidebar Izquierdo (Control de Misión):**
    * **Superior:** Navegación entre módulos.
    * **Inferior (Footer):** Acceso rápido a **Settings**. El diseño se ha simplificado eliminando iconos redundantes del header.
2. **The Monolithic Box:** Contenedores con colores base sólidos (`bg-background`).
    * **Hairline Borders:** Bordes extremadamente finos (`border-foreground/10`) para definir paneles sin sombras pesadas.
    * **Relieve Negativo:** Sombras interiores (`shadow-inner`) para simular paneles hundidos o tallados.
3. **Inspector Central (Right Panel):**
    * **Unificación:** Eliminación de pestañas secundarias (Notas, Explorer). El panel se dedica 100% al contexto de la entidad o herramienta activa.
    * **Cabecera Minimalista:** Título dinámico de la entidad y botón de cierre integrado.

## ORGANIZACIÓN VISUAL (ATOMIC DESIGN)

La capa de presentación (`/presentation`) se rige estrictamente por Atomic Design:

1. **Atoms:** Componentes base indivisibles (botones, inputs).
2. **Molecules:** Uniones simples de átomos.
3. **Organisms:** Secciones complejas (ej. el Universal Inspector, el explorador de entidades).
4. **Templates:** Layouts de página.
5. **Pages:** Vistas completas.

## DIRECTRICES DE CÓDIGO UI (REACT)

Para mantener la calidad y homogeneidad en la capa de presentación (`/presentation`):
1. **Componentes Uniformes:** Obligatorio el uso de *Arrow Functions* (`const Component = () => {}`) para la declaración de todo componente visual. Prohibido el uso de `function`.
2. **Flujo de Renderizado Predecible:** Prohibido el uso de *early returns* como lógicas de escape (`if (!data) return null;`). Se deben utilizar siempre bloques condicionales anidados (`if/else`) o asignaciones ternarias para un flujo de renderizado controlado.
3. **Tipado Riguroso:** Cero uso de `any`. Las propiedades deben estar estipuladas explícitamente mediante una `interface` de TypeScript. Usar `unknown` en casos de duda.
