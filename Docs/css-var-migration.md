# CSS Variables Migration: Technical Zen Standard (COMPLETED ✅)

## Rationale
The migration from hardcoded hex values to CSS variables was essential to:
- **Unify color tokens** across all modules (Bible, Atlas, Timeline).
- **Enable dynamic theme support** (Deep Space, Nebula, etc.) via `:root` variables.
- **Enforce the Technical Zen aesthetic**: Eliminating arbitrary transparencies in favor of semantic opacities (`foreground/X`).

## Current Implementation (Mayo 2026)
- **Core Tokens**: Defined in `src/assets/index.css` using HSL variables.
- **Semantic Mapping**: Tailwind extended to support `foreground/5`, `foreground/10`, etc.
- **Themes**: All themes (Dark, Light, etc.) drive the same variable names, ensuring total UI consistency.

## Standard "Technical Zen"
1. **Panels**: Use `bg-background` or `bg-foreground/5` for subtle depth.
2. **Borders**: Use `border-foreground/10` for hair-line precision.
3. **Text**: Use `text-foreground` (100%), `text-foreground/60` (secondary), or `text-foreground/40` (metadata).
4. **Highlights**: Use `text-primary` or `bg-primary/10`.

## Verification & Maintenance
- **Prohibition**: Hardcoded hex values (e.g., `bg-[#1a1a1a]`) are now deprecated and will be flagged in code reviews.
- **Atomic Design**: Atoms and Molecules must rely exclusively on these variables.

This migration is considered **closed**. All future UI work must adhere to the semantic token system defined here.
