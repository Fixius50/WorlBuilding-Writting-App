# CONTEXTO: UX & UI (TECHNICAL ZEN)

Este documento define la estética y experiencia de usuario obligatoria para la aplicación Chronos Atlas. Debe ser consumido por el **[MOD-1] Estratega** al diseñar y por el **[MOD-2] Arquitecto** al implementar.

## 🎨 Filosofía "Technical Zen"
El diseño debe evocar la sensación de estar operando maquinaria de alta precisión, una bóveda arquitectónica de información. No es una aplicación lúdica, es una herramienta profesional para la creación de mundos.

### 1. El Paradigma "Monolithic Box"
- **Layouts Sólidos**: Las interfaces deben estar contenidas en paneles claramente definidos con bordes sutiles.
- **Cero Plástico Digital (CRÍTICO)**: Está **ESTRICTAMENTE PROHIBIDO** el uso de efectos `backdrop-filter: blur()`, "glassmorphism" excesivo o paneles translúcidos. Las interfaces deben sentirse sólidas, no de cristal.
- **Fondos Opacos**: Usa los colores sólidos definidos en el sistema (`bg-background`, `bg-foreground`, etc.).

### 2. Micro-interacciones
- **Secas y Precisas**: Las animaciones de transición deben ser rápidas y mecánicas. Evita los efectos "elásticos" o "bouncy". 
- **Feedback Táctil Visual**: Al hacer hover o clic, el cambio de estado (color, borde) debe ser inmediato y evidente, apoyado en transiciones de opacidad o bordes.

### 3. Tipografía (Jerarquía Híbrida)
- **Modo Lectura (Lore/Historias)**: Usar tipografías **Serif** para textos largos y narrativos (Ej: Biografías, Cuadernos).
- **Modo Técnico (Metadatos/UI)**: Usar tipografías **Sans-serif** o **Monospace** con tracking amplio (`tracking-widest`) en mayúsculas (`uppercase`) para etiquetas, IDs, paneles y botones pequeños.

### 4. TailwindCSS Dinámico
- Prohibido el uso de colores HEX directos en las clases (`text-[#ff0000]`). Utilizar siempre los tokens del tema (`text-primary`, `bg-foreground/10`, `border-border`).
