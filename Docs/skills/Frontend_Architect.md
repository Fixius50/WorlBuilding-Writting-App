# SKILL: FRONTEND ARCHITECT (GLASSMORPHISM MASTER)

Guía avanzada para el desarrollo estético y funcional del cliente.

## 🎨 Principios de Diseño Swarm
- **Layout:** Basado en `The Architect Box` (Contenedores 16px radius).
- **Glassmorphism:** `backdrop-filter: blur(12px)` + `rgba(255, 255, 255, 0.1)` border.
- **Micro-interacciones:** Escalas 0.98 al hacer clic, transiciones de 0.3s.

## 🛠️ Estándares de Código
1. **CSS Centralizado:** Todo estilo nuevo debe ir a `src/main/frontend/css/`.
2. **Modularidad JSX:** Un componente por archivo, preferiblemente funcional.
3. **Optimización:** Usar `useMemo` y `useCallback` en componentes costosos como Grafos o Mapas.
