CSS Variables Migration: Rationale and Plan

- Why migrate hardcoded CSS to CSS variables:
  - Unify color tokens across the app for visual consistency.
  - Enable theme support (dark/light) from a single source of truth.
  - Reduce duplication and risk of drift in colors, borders, and shadows.
  - Improve maintainability and scalability of the UI system.

- What was done:
  - Introduced semantic color tokens in src/assets/index.css (e.g., --color-indigo, --color-emerald, --color-red, --color-amber, --color-purple, --color-orange, --color-blue, --color-cyan, --color-destructive).
  - Extended theme blocks (.dark, .theme-dark, .theme-light, etc.) to expose these tokens via CSS variables.
  - Added a set of utility CSS classes that map to semantic color usage (e.g., .bg-indigo, .text-indigo, .border-indigo) to simplify future replacements.

- How to verify:
  - Build and run the app locally (npm install; npm run build; npm run dev).
  - Inspect multiple components (WorldBible, Timeline, Maps, Linguistics, Writing) to ensure color, border, and shadow styling are consistent and driven by CSS variables.
  - Toggle themes (light/dark) and verify visuals adjust accordingly.

- How to keep going:
  - Continue applying the replacements across components (files listed in the task plan).
  - When all changes are in, commit using a message focused on the rationale (what/why).

This document serves as the living rationale for the migration and as a reference for future contributors.
