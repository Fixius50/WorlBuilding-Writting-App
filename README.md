# Chronos Atlas - Worldbuilding Engine

Chronos Atlas es una aplicación de worldbuilding local-first para escritura, planificación narrativa, mapas, relaciones, líneas temporales y gestión de entidades dinámicas.

La base funcional actual se centra en:

- Frontend React + TypeScript + Vite con arquitectura feature-first (vertical slices).
- Persistencia local en SQLite WASM (SQLocal) sobre OPFS.
- Backend Java auxiliar para bridge de sistema de archivos, backups y endpoints de soporte.

## Estado Actual

El proyecto está en evolución activa. La documentación técnica vive en la carpeta Docs y este README refleja estructura y stack vigentes del repositorio.

## Stack Tecnológico Actual

### Frontend

- React 19.2.4
- TypeScript 5.7.x (strict)
- Vite 6
- Zustand
- TanStack Query
- TanStack Table
- React Router
- MapLibre + Deck.gl
- Tiptap
- Tailwind CSS

### Persistencia

- SQLocal (SQLite WASM)
- OPFS (Origin Private File System)

### Backend Auxiliar

- Java 21
- Spring Web MVC 5.3.31
- Jetty embebido
- Maven

## Dibujo Explicativo de Arquitectura

### 1) Vista Estructural (Carpetas y Ownership)

```mermaid
flowchart LR
	UI[Frontend React + Vite] --> F[Features por dominio]
	F --> A[application]
	F --> P[pages]
	F --> C[components]
	F --> H[hooks]
	F --> D[domain]
	F --> S[store]

	UI --> SH[Shared UI transversal]
	SH --> SH1[primitives]
	SH --> SH2[navigation]
	SH --> SH3[modals]
	SH --> SH4[panels]
	SH --> SH5[feedback]
	SH --> SH6[visuals]
```

### 2) Vista Runtime (Flujo de Ejecución)

```mermaid
flowchart LR
	V[Vista en pages/components] --> U[UseCase en application]
	U --> I[infrastructure localDB/network]
	I --> L[(SQLite WASM en OPFS)]
	I --> J[Backend Java auxiliar]

	V --> H[hooks]
	H --> V

	subgraph Frontend
		V
		H
		U
		I
		L
	end

	subgraph Backend
		J
	end
```

## Estructura Principal de Carpetas

```text
WorlBuilding-Writting-App/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── infrastructure/
│   │   │   ├── localDB/
│   │   │   ├── network/
│   │   │   └── utils/
│   │   ├── features/
│   │   │   ├── Shared/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── primitives/
│   │   │   │   │   ├── navigation/
│   │   │   │   │   ├── modals/
│   │   │   │   │   ├── panels/
│   │   │   │   │   ├── feedback/
│   │   │   │   │   ├── visuals/
│   │   │   │   │   └── editor/
│   │   │   │   └── StatCard.tsx
│   │   │   ├── Entities/
│   │   │   │   ├── application/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   └── index.ts
│   │   │   └── ... otras features
│   │   ├── locales/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/main/java/com/worldbuilding/
│   │   ├── core/
│   │   └── domains/
│   ├── pom.xml
│   └── mvnw.cmd
├── Docs/
├── scripts/
├── LICENSE.txt
└── LICENSE-MPL-2.0.txt
```

## Ejecución Local

### Opción rápida (Windows)

Desde scripts:

```bat
run-app.bat
```

### Opción manual

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend auxiliar:

```bat
cd backend
mvnw.cmd compile exec:java -Dexec.mainClass=com.worldbuilding.core.AuxServerApplication
```

## Build

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bat
cd backend
mvnw.cmd -DskipTests package
```

## Documentación de Proyecto

- Reglas maestras: Docs/00_Reglas_Maestras.md
- Estrategia técnica: Docs/01_Estrategia_Tecnica.md
- Diseño UI/UX: Docs/02_Diseño_UI_UX.md
- Roadmap vivo: Docs/03_Roadmap_Vivo.md
- Arquitectura de workspaces: Docs/04_Arquitectura_Workspaces.md

## Convenciones de Arquitectura Frontend

- Arquitectura objetivo: Feature-Sliced Architecture (vertical slices).
- Carpeta estándar por feature según necesidad: application, components, hooks, pages, domain, store.
- Regla de hooks:
  - Hook reutilizable dentro de la feature: hooks/
  - Hook exclusivo de una pantalla: colocalizado en pages/
- index.ts de cada feature permanece en raíz como API pública.

## Licenciamiento

El proyecto mantiene un modelo de licencia dual. Consultar:

- LICENSE.txt
- LICENSE-MPL-2.0.txt
