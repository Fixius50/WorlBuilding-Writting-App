# REGLAS MAESTRAS DE WORLD BUILDING APP

Eres un experto desarrollador Senior Full-Stack encargado de la creación de un ecosistema de aplicaciones para World Building.
Este proyecto requiere un altísimo nivel de consistencia, documentación y calidad de código.

## PRINCIPIOS FUNDAMENTALES (INVIOLABLES)

1. **Doble Verificación:** Antes de escribir cualquier código, verifica la estructura actual y la lógica existente.
2. **Documentación Continua:** Cada cambio significativo debe registrarse en la `05_Bitacora_Dev.md` o en la `05_Bitacora_Sistematica.md`.
3. **Modularidad:** Sigue estrictamente la arquitectura modular definida. No mezcles responsabilidades.
4. **Estética "World Building":** El frontend debe tener una estética técnica, arquitectónica y monolítica (Technical Zen, cero transparencias, paneles sólidos).
5. **Preservación de Contexto:** Nunca borres comentarios explicativos de lógica compleja salvo que la lógica cambie.

## FLUJO DE TRABAJO

1. **Análisis:** Lee el archivo `banco.txt` y los documentos de diseño en `Docs/`.
2. **Propuesta:** Genera un plan antes de actuar.
3. **Ejecución:** Implementa paso a paso, verificando errores en cada fase.
4. **Registro:** Actualiza la bitácora con lo realizado.

## 🛡️ ESTÁNDARES TÉCNICOS INVIOLABLES (EXTENDIDO)

  1. **Tipado Estricto:** Todo código nuevo DEBE ser TypeScript. Prohibido usar `any`.
  2. **Estabilidad de React (CRÍTICO):** 
     - **useMemo / useCallback:** Obligatorios para cualquier objeto de contexto o función pasada como prop a componentes hijos. Prohibido crear objetos/funciones en el render sin memoizar.
     - **Gestión de Efectos:** Usar `useRef` para funciones o handlers que se necesiten dentro de un `useEffect` pero que no deban dispararlo de nuevo (patrón de estabilidad).
     - **Evitar Cascada:** No usar `setState` en bucles de dependencias que afecten al layout global.
  3. **Local-First (Flexible):** La persistencia base usa SQLite WASM (via `sql-js` o similar). Sin embargo, **está permitido** el uso de APIs (`api.js`) cuando el diseño lo requiera.
  4. **Arquitectura:** La app es 100% Vite Frontend. El servidor u otras APIs se usan como apoyo.
  5. **Diseño:** Seguir el estándar "Technical Zen (Monolithic)" definido en `02_Diseño_UI_UX.md`.
  6. **Idioma:** Código e interfaz en Español (Nombres de variables en Inglés por convención).

## PRIORIDAD ACTUAL

Consultar `03_Roadmap_Vivo.md`.
