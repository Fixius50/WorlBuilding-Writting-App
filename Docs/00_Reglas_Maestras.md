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

## CREACIÓN Y GESTIÓN DE COMPONENTES

1. **Sintaxis Exclusiva (Arrow Functions):** 
   - Se debe utilizar obligatoriamente la sintaxis de funciones flecha (`const Component = () => {}`) para la declaración de todos los componentes, servicios y funciones. Queda **ESTRICTAMENTE PROHIBIDO** el uso de la palabra reservada `function` para declaraciones estándar.
2. **Flujo de Control (Prohibido Early Return en Ifs):** 
   - Las validaciones y lógicas de escape NO pueden estar sueltas o ejecutarse mediante `return` dentro de sentencias `if` (ej. `if (!condition) return;` está **prohibido**).
   - Se debe envolver la lógica en bloques condicionales (ej. `if (condition) { ... }`) para garantizar un flujo de control predecible. Priorizar sentencias `switch` y operadores ternarios.
3. **Tipado Estricto:** 
   - Prohibido el uso de `any`. Si un tipo no es determinable, se debe usar `unknown`. Todo componente React debe tipar sus `props` mediante `interface`.
4. **Preservación de Código (Comentarios):** 
   - El código antiguo con valor histórico NO debe borrarse de inmediato. Si se reemplaza lógica compleja, debe comentarse para mantener la trazabilidad.

## RESPONSABILIDAD POR CAPAS (CLEAN ARCHITECTURE / DDD)

El proyecto está dividido en un ecosistema robusto. El Frontend respeta las siguientes responsabilidades estrictas:

- **`/domain` (Capa de Dominio):**
  - **Dedicado a:** Modelos de datos puros y definiciones de tipos estáticos.
  - **Reglas:** No debe tener dependencias de ninguna otra capa de la aplicación ni de librerías de UI (React).
- **`/application` (Capa de Aplicación):**
  - **Dedicado a:** Casos de uso (`useCases`) que orquestan los flujos del usuario y la lógica de negocio.
  - **Reglas:** Actúa como puente. No renderiza componentes visuales ni ejecuta peticiones directas de bajo nivel.
- **`/infrastructure` (Capa de Infraestructura):**
  - **Dedicado a:** Repositorios de acceso a datos locales (`sqlocal`/SQLite) o remotos, clientes HTTP y utilidades técnicas.
  - **Reglas:** Es la *única* capa autorizada para tener contacto directo con sentencias SQL o fetch/axios.
- **`/presentation` (Capa de Presentación / UI):**
  - **Dedicado a:** El ecosistema de React ordenado bajo Atomic Design (`atoms`, `molecules`, `organisms`, `pages`, `layout`).
  - **Reglas:** Exclusivamente para el renderizado. Consume funciones de `application` y estado global (`stores`). **Cero** lógica pesada de persistencia de datos.
- **`/features` (Módulos Funcionales):**
  - **Dedicado a:** Módulos altamente especializados (Graph, Mapas, Timeline) agrupados verticalmente.
  - **Reglas:** Para características pesadas, se debe implementar el **Patrón Hook-View** (Desacoplar la lógica compleja en un custom hook como `useFeatureLogic.tsx` y dejar el archivo base como `.tsx` de solo renderizado visual).

## PRIORIDAD ACTUAL

Consultar `03_Roadmap_Vivo.md`.
