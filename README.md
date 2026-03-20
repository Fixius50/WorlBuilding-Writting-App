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

- **Estructura Core:** `Docs/00_Reglas_Maestras.md` a `04_Arquitectura_Workspaces.md`.
- **Bitácora Maestra:** `Docs/05_Bitacora_Maestra.md` (Historial consolidado).
- **Linguistic Engine:** `Docs/06_Arquitectura_Linguistica.md`.
- **Technical Skills:** `Docs/skills/` (Guías de Arquitecto, Experto y Master).
- **Testing & Scripts:** `Docs/mcps/` y `Docs/scripts/`.

## 🔧 Desarrollo

### Reiniciar Backend desde UI

1. Inicia con `.\INICIAR.bat`
2. Abre <http://localhost:8080>
3. Usa el botón "Reiniciar Backend" en la pantalla principal

### Estructura del Proyecto

```text
WorldbuildingApp/
├── src/               # Frontend y Backend Fusionados
│   ├── main/          # Backend (Spring Boot Java)
│   ├── assets/        # Frontend (Tailwind/CSS)
│   ├── components/    # Frontend (React UI)
│   ├── features/      # Frontend (Lógica y Vistas)
│   └── database/      # Frontend (Client IndexedDB)
├── scripts/           # Scripts NodeJS de Refactorización y Utils
├── Docs/              # Documentación de Arquitectura y Logs
└── pom.xml            # Configuración Raíz de Maven
```

## 📝 Notas

- El backend corre en `http://localhost:8080`
- El frontend (dev) corre en `http://localhost:5173`
- Los logs se guardan en `Docs/logs/server.log`
