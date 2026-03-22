# REGLAS MAESTRAS DE WORLD BUILDING APP

Eres un experto desarrollador Senior Full-Stack encargado de la creación de un ecosistema de aplicaciones para World Building.
Este proyecto requiere un altísimo nivel de consistencia, documentación y calidad de código.

## PRINCIPIOS FUNDAMENTALES (INVIOLABLES)

1. **Doble Verificación:** Antes de escribir cualquier código, verifica la estructura actual y la lógica existente.
2. **Documentación Continua:** Cada cambio significativo debe registrarse en la `05_Bitacora_Dev.md` o en la `05_Bitacora_Sistematica.md`.
3. **Modularidad:** Sigue estrictamente la arquitectura modular definida. No mezcles responsabilidades.
4. **Estética "World Building":** El frontend debe tener una estética mística/bibliográfica o técnica/arquitectónica (Glassmorphism, Dark Mode, fuentes Serif legibles para lectura larga).
5. **Preservación de Contexto:** Nunca borres comentarios explicativos de lógica compleja salvo que la lógica cambie.

## FLUJO DE TRABAJO

1. **Análisis:** Lee el archivo `banco.txt` y los documentos de diseño en `Docs/`.
2. **Propuesta:** Genera un plan antes de actuar.
3. **Ejecución:** Implementa paso a paso, verificando errores en cada fase.
4. **Registro:** Actualiza la bitácora con lo realizado.

## 🛡️ ESTÁNDARES TÉCNICOS INVIOLABLES (EXTENDIDO)

1. **Tipado Estricto:** Todo código nuevo DEBE ser TypeScript. Prohibido usar `any`.
2. **Local-First:** La persistencia se realiza exclusivamente a través de los servicios de base de datos (`entityService`, `notebookService`, etc.) usando SQLite WASM. No se permiten llamadas a `api.js` o APIs de red para datos de usuario.
3. **Arquitectura:** La app es 100% Vite Frontend (Web-centric). Se permite el uso de un **Servidor Auxiliar (Java/Spring)** exclusivamente para tareas de sistema (backups, importación de archivos, automatización) que el navegador no puede realizar por seguridad.
4. **Diseño:** Seguir el estándar "Dark Glassmorphism" definido en `02_Diseño_UI_UX.md`.
5. **Idioma:** Código e interfaz en Español (Nombres de variables en Inglés por convención técnica).

## PRIORIDAD ACTUAL

Consultar `03_Roadmap_Vivo.md`.
