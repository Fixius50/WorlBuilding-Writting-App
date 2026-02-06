# WorldbuildingApp V2

Aplicación full-stack para worldbuilding con soporte para conlangs, mapas, líneas temporales y más.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
.\INICIAR.bat
```

Este script:

- ✅ Construye el frontend automáticamente
- ✅ Inicia el backend con auto-restart
- ✅ Permite reiniciar desde la UI con el botón "Reiniciar Backend"

### Opción 2: Manual

**Terminal 1 - Frontend:**

```bash
npm run dev
```

**Terminal 2 - Backend:**

```bash
.\mvnw.cmd spring-boot:run
```

## 📋 Requisitos

- **Node.js** 18+ (para frontend)
- **Java** 21+ (para backend)
- **Maven** (incluido como wrapper: `mvnw.cmd`)

## 🧪 Testing

Ejecutar suite de tests:

```bash
node Docs/mcps/scripts/test-all.mjs
```

Ver `Docs/mcps/scripts/README.md` para más opciones de testing.

## 📚 Documentación

- **MCPs de Testing:** `Docs/mcps/README.md`
- **Scripts:** `Docs/scripts/README.md`
- **Logs:** `Docs/logs/`

## 🔧 Desarrollo

### Reiniciar Backend desde UI

1. Inicia con `.\INICIAR.bat`
2. Abre <http://localhost:8080>
3. Usa el botón "Reiniciar Backend" en la pantalla principal

### Estructura del Proyecto

```
WorldbuildingApp/
├── src/main/
│   ├── java/          # Backend (Spring Boot)
│   ├── frontend/      # Frontend (React + Vite)
│   └── resources/     # Recursos y configuración
├── Docs/
│   ├── mcps/          # Scripts de testing MCP
│   ├── scripts/       # Scripts de utilidad
│   └── logs/          # Logs del servidor
└── INICIAR.bat        # Script principal de inicio
```

## 📝 Notas

- El backend corre en `http://localhost:8080`
- El frontend (dev) corre en `http://localhost:5173`
- Los logs se guardan en `Docs/logs/server.log`
