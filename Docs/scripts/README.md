# Scripts del Proyecto

Este directorio contiene scripts antiguos y de utilidad para el proyecto WorldbuildingApp.

## Scripts Principales (en raíz del proyecto)

### INICIAR.bat ⭐ **RECOMENDADO**

Script principal para iniciar la aplicación completa.

**Qué hace:**

1. Construye el frontend (React + Vite)
2. Inicia el backend con auto-restart habilitado
3. Detecta automáticamente cuando presionas "Reiniciar Backend" en la UI

**Uso:**

```bash
.\INICIAR.bat
```

## Scripts Antiguos (en este directorio)

### run_app_OLD.bat

Script antiguo que iniciaba frontend y backend en ventanas separadas.  
**Estado:** Reemplazado por `INICIAR.bat`

### start-with-autorestart_OLD.bat

Script antiguo de auto-restart del backend.  
**Estado:** Funcionalidad integrada en `INICIAR.bat`

## Scripts de Testing

Los scripts de testing automatizado están en `Docs/mcps/scripts/`:

- `test-all.mjs` - Suite completa de tests
- `validate-database.mjs` - Validación de base de datos
- Y más...

Ver `Docs/mcps/scripts/README.md` para más información.
