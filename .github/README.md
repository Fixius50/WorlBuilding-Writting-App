# AI Governance In This Repo

Este repositorio centraliza la configuración para agentes y análisis de IA en `.github`.

## Estructura oficial
- `.github/agents/`: definición de agentes y modos (ej. `CEREBRO.agent.md`).
- `.github/context/`: contexto de arquitectura, stack y UX.
- `.github/workflows/`: procedimientos operativos reutilizables.
- `.github/modernize/` y `.github/java-upgrade/`: flujos especializados de modernización/upgrade.

## Regla de precedencia recomendada
1. Instrucciones del sistema/plataforma.
2. Agente activo en `.github/agents/`.
3. Reglas globales en `.github/copilot-instructions.md`.
4. Contexto de dominio en `.github/context/`.
5. Workflows en `.github/workflows/` y flujos especializados en `.github/modernize/`.

## Convención para análisis consistentes
- Al pedir análisis, referenciar explícitamente: objetivo + módulo + contexto a usar.
- Ejemplo: "Analiza persistencia de Writing usando `.github/context/Stack_Frontend_LocalFirst.md` y `.github/context/Architecture_Hybrid_Core.md`".

## Nota de migración
- El contenido previo de `.agents/` fue migrado a `.github/` para tener una única fuente de verdad.
