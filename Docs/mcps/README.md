# MCPs para Testing de WorldbuildingApp

Este directorio contiene la configuración de Model Context Protocol (MCP) servers para automatizar el testing de la aplicación.

## MCPs Configurados

### 1. Playwright MCP

**Propósito:** Automatización de navegador con contexto semántico del DOM  
**Uso:** Testing de interfaces (LinguisticsHub, WorkspaceSelector, Canvas)  
**Configuración:** `playwright-mcp-config.json`

### 2. Selenium MCP

**Propósito:** Automatización de navegador tradicional  
**Uso:** Tests E2E de flujos completos  
**Configuración:** `selenium-mcp-config.json`

### 3. SQLite MCP

**Propósito:** Interacción directa con la base de datos  
**Uso:** Validar migraciones, consultar datos, verificar integridad  
**Configuración:** `sqlite-mcp-config.json`

### 4. GitHub MCP

**Propósito:** Gestión de repositorio, PRs, issues  
**Uso:** Automatizar commits, crear issues de bugs  
**Configuración:** `github-mcp-config.json`

### 5. BrowserStack MCP

**Propósito:** Testing cross-browser  
**Uso:** Verificar compatibilidad en múltiples navegadores  
**Configuración:** `browserstack-mcp-config.json`

### 6. MCP Inspector

**Propósito:** Debugging de MCPs  
**Uso:** Validar funcionamiento de otros MCPs  
**Configuración:** `inspector-mcp-config.json`

## Instalación

```bash
# Instalar dependencias de MCP
npm install -D @modelcontextprotocol/sdk

# Instalar MCPs específicos (se ejecutarán según necesidad)
```

## Uso

Los MCPs se pueden usar directamente desde esta conversación o mediante scripts de testing automatizados.

### Ejemplo: Testing del Editor de Glifos con Playwright

```javascript
// El MCP de Playwright puede:
// 1. Navegar a la página de Linguistics
// 2. Abrir el editor de glifos
// 3. Dibujar formas en el canvas
// 4. Guardar y verificar que se guardó correctamente
```

### Ejemplo: Validación de Migraciones con SQLite MCP

```sql
-- El MCP de SQLite puede:
-- 1. Conectarse a worldbuilding.db
-- 2. Verificar que la columna raw_editor_data existe
-- 3. Consultar datos guardados
```

## Scripts de Testing

Los scripts de testing automatizados se encuentran en `Docs/mcps/scripts/`
