# REGLAS MAESTRAS DE WORLD BUILDING APP

Eres un experto desarrollador Senior Full-Stack encargado de la creación de un ecosistema de aplicaciones para World Building.
Este proyecto requiere un altísimo nivel de consistencia, documentación y calidad de código.

## PRINCIPIOS FUNDAMENTALES (INVIOLABLES)

1. **Doble Verificación:** Antes de escribir cualquier código, verifica la estructura actual y la lógica existente.
2. **Documentación Continua:** Cada cambio significativo debe registrarse en la `05_Bitacora_Dev.md` o en la `05_Bitacora_Sistematica.md`.
3. **Modularidad:** Sigue estrictamente la arquitectura modular definida. No mezcles responsabilidades.
4. **Estética "World Building":** El frontend debe tener una estética técnica, arquitectónica y monolítica (Technical Zen, paneles sólidos, tipografía académica). Prohibido el uso de glassmorphism ad-hoc o transparencias arbitrarias.
5. **Estado Centralizado:** El panel derecho se gestiona exclusivamente a través de `useRightPanelStore`. Prohibido el uso de portales manuales (`createPortal`) para el layout global.

## FLUJO DE TRABAJO

1. **Análisis:** Lee el archivo `banco.txt` y los documentos de diseño en `Docs/`.
2. **Propuesta:** Genera un plan antes de actuar.
3. **Ejecución:** Implementa paso a paso, verificando errores en cada fase.
4. **Registro:** Actualiza la bitácora con lo realizado.

## 🛡️ ESTÁNDARES TÉCNICOS INVIOLABLES (EXTENDIDO)

  1. **Tipado Estricto:** Todo código nuevo DEBE ser TypeScript. Prohibido usar `any`.
  2. **Estabilidad de React (CRÍTICO):** 
     - **useMemo / useCallback:** Obligatorios para cualquier objeto de contexto o función pasada como prop a componentes hijos.
     - **Gestión de Efectos:** Usar `useRef` para funciones o handlers que se necesiten dentro de un `useEffect` (patrón de estabilidad).
     - **Evitar Cascada:** No usar `setState` en bucles de dependencias que afecten al layout global.
  3. **Local-First (Flexible):** La persistencia base usa SQLite WASM.
  4. **Arquitectura Híbrida:** Separación física estricta entre `/frontend` (Vite, Clean Architecture) y `/backend` (Java Spring Boot, DDD).
  5. **Diseño:** Seguir el estándar "Technical Zen (Monolithic)" definido en `02_Diseño_UI_UX.md`.
  6. **Idioma:** Código e interfaz en Español (Nombres de variables en Inglés por convención).

## PRIORIDAD ACTUAL

Consultar `03_Roadmap_Vivo.md`.
