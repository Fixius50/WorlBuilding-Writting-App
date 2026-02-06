# Scripts de Testing con MCPs

Este directorio contiene scripts de ejemplo para testear WorldbuildingApp usando MCPs.

## Scripts Disponibles

### 1. test-glyph-editor.mjs

**MCP:** Playwright  
**Propósito:** Testear el editor de glifos  
**Uso:**

```bash
node Docs/mcps/scripts/test-glyph-editor.mjs
```

**Qué hace:**

- Navega a la app
- Selecciona un workspace
- Abre la sección de Linguistics
- Abre el editor de glifos
- Toma screenshot del resultado

### 2. validate-database.mjs

**MCP:** SQLite (using better-sqlite3)  
**Propósito:** Validar esquema de base de datos  
**Uso:**

```bash
node Docs/mcps/scripts/validate-database.mjs
```

**Qué hace:**

- Verifica que la columna `raw_editor_data` existe
- Revisa el historial de migraciones de Flyway
- Cuenta palabras en el léxico
- Verifica palabras con datos de canvas
- Lista todas las tablas de la base de datos

**Nota:** Requiere que el backend se haya ejecutado al menos una vez para crear la base de datos.

## Requisitos

```bash
# Instalar dependencias
npm install -D @modelcontextprotocol/sdk better-sqlite3
```

## Crear tus propios tests

1. Copia uno de los scripts de ejemplo
2. Modifica los pasos según tu caso de uso
3. Ejecuta con `node Docs/mcps/scripts/tu-script.mjs`

## Integración con CI/CD

Estos scripts pueden integrarse en pipelines de CI/CD:

```yaml
# Ejemplo para GitHub Actions
- name: Run MCP Tests
  run: |
    node Docs/mcps/scripts/validate-database.mjs
    node Docs/mcps/scripts/test-glyph-editor.mjs
```
