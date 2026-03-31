# SKILL: FRONTEND ARCHITECT (TECHNICAL ZEN MASTER)

Guía avanzada para el desarrollo estético y funcional del cliente (React 19 + Vite).

## 🎨 Principios de Diseño Swarm

- **Layout:** Basado en diseño "Monolithic" (The Architect Box). Paneles limpios y sólidos sin adornos innecesarios (Technical Zen).
- **Cero Plástico Digital:** Prohibido el uso de `backdrop-filter: blur()` o fondos translúcidos. Uso de colores base sólidos basados en variables CSS.
- **Micro-interacciones:** Rápidas, precisas, sin animaciones elásticas excesivas.
- **Tipografía:** Uso de fuentes Serif para lectura larga y Mono/Sans para UI técnica.

## 🛠️ Estándares de Código (TypeScript Estricto)

1. **Tipado Obligatorio:** Cero uso de `any`. Si no se conoce el tipo, usar explícitamente `unknown` y validarlo (Type Guards).
2. **Conectividad y APIs:** Se pueden mantener/usar llamadas a APIs (`api.js`, red) junto con la persistencia `sqlocal`. No es obligatorio el aislamiento absoluto.
3. **Tailwind Dinámico:** Usar variables CSS del tema (`bg-background`). No aplicar colores HEX hardcodeados.
4. **Optimización:** Usar `useMemo` y `useCallback` en componentes costosos como Grafos o Mapas.
