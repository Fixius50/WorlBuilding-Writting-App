# Copilot Instructions (Repo)

Usa `.github` como única fuente de configuración para análisis e implementación.

## Obligatorio
- Leer `.github/agents/CEREBRO.agent.md` cuando el modo/rol sea CEREBRO.
- Alinear decisiones con `.github/context/` antes de proponer cambios.
- Aplicar workflows de `.github/workflows/` cuando la tarea coincida.

## Contexto por tipo de tarea
- Arquitectura general: `.github/context/Architecture_Hybrid_Core.md`
- Reglas de interacción entre roles: `.github/context/Matrix_Adapter.md`
- Frontend local-first: `.github/context/Stack_Frontend_LocalFirst.md`
- Backend auxiliar: `.github/context/Stack_Backend_Auxiliar.md`
- UX/UI: `.github/context/UX_Technical_Zen.md`

## Ejecución
- Priorizar cambios mínimos, tipado estricto y preservación de estilo existente.
- Para análisis, siempre explicitar alcance Front-to-Back y riesgos de persistencia.
- Si existen dudas de precedencia, usar `.github/README.md` como guía.
