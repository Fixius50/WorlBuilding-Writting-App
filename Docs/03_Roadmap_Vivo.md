# ROADMAP VIVO DEL PROYECTO

Documento orientado solo a trabajo abierto y en curso.

## ESTADO ARQUITECTÓNICO ACTUAL (RESUMEN)

- Frontend consolidado en **Feature-Sliced Architecture**.
- `Shared/components` eliminado; estructura activa en `Shared/ui` + `Shared/StatCard.tsx`.
- `Shared/ui` reagrupado por dominios visuales (`primitives`, `navigation`, `modals`, `panels`, `feedback`, `visuals`) con puentes de compatibilidad.
- Hooks extraídos de `components/use*` a `hooks/` por feature.
- Hooks de uso único de pantalla colocalizados en `pages/`.

## EN CURSO

- [ ] Consolidar separación POO del módulo de mapas (dominio, orquestación y serialización).
- [ ] Eliminar persistencia directa en `localStorage/sessionStorage` y completar estrategia híbrida (caché de módulo + flush a SQLite al salir del módulo).
- [ ] Revisar y unificar rutas y contratos de navegación en módulos especializados (mapas, genealogía, planificación).
- [ ] Reducir deuda de tipado en hooks y componentes críticos (`any` -> tipado explícito).
- [ ] Alinear documentación funcional con comportamiento real del código activo.
- [ ] Completar eliminación gradual de puentes legacy de imports cuando todos los consumidores estén migrados.
- [ ] Revisar exports públicos (`index.ts`) de features para mantener API mínima y estable.

## CIERRES RECIENTES

- [x] Normalización de estructura en features con archivos raíz sueltos (migración a `pages/` sin mover `index.ts`).
- [x] Separación explícita `components` y `hooks` en features clave.
- [x] Actualización de alias y estructura de `Shared` para reducir ambigüedad en análisis automatizado.

## ABIERTOS (FASE 4)

- [ ] Optimización de rendimiento en consultas relacionales complejas.
- [ ] Ajuste de UX y estabilidad de paneles contextuales por feature.
- [ ] Fortalecer control de errores de frontend sin ruido en consola.

## ABIERTOS (FASE 5)

- [ ] Módulo de Planificación Visual (Whiteboards):
  - [ ] Post-its, referencias y conectores.
  - [ ] Gestión visual de arcos narrativos.

- [ ] Especialización de Entidades Pro:
  - [ ] Genealogías con linajes y parentescos complejos.
  - [ ] Sistemas de magia/religión con reglas y jerarquías.

- [ ] Líneas Temporales de segunda generación:
  - [ ] Calendarios fantásticos personalizables.
  - [ ] Ciclos, lunas y reglas temporales avanzadas.

- [ ] Motor lingüístico avanzado:
  - [ ] Reglas de conjugación y evolución fonética.
  - [ ] Composición por reglas silábicas y expansión de diccionario.

- [ ] Compilación editorial:
  - [ ] Exportación EPUB/PDF.
  - [ ] Exportación DOCX/wiki offline HTML.

- [ ] Colaboración P2P (WebRTC):
  - [ ] Invitación, conexión y sincronización silenciosa.
  - [ ] Resolución asistida de conflictos.
