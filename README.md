# Chronos Atlas — Worldbuilding Engine 🌌
**The Architect's Vault | Local-First & Technical Zen**

Chronos Atlas es un motor de worldbuilding de alto rendimiento diseñado para arquitectos de mundos, escritores y lingüistas. Construido bajo una arquitectura **Local-First**, prioriza la soberanía de los datos del usuario mediante el uso de SQLite WASM directamente en el navegador.

---

## 🏗️ Arquitectura Local-First
A diferencia de las aplicaciones web tradicionales, Chronos Atlas funciona con una base de datos **SQLite (WASM + OPFS)** persistente en tu sistema de archivos local (via navegador), garantizando:
- **Latencia Zero:** Operaciones de base de datos a velocidad local.
- **Soberanía:** Tus universos viven en un archivo `.sqlite3` que puedes mover o respaldar libremente.
- **Privacidad:** Los datos nunca abandonan tu máquina a menos que decidas sincronizarlos explícitamente.

---

## 🚀 Inicio Rápido

### Ejecución con un solo clic (Windows)
```bash
.\INICIAR.bat
```
Este script orquestador automatiza el despliegue del frontend, el backend de sincronización y el motor de base de datos.

### Desarrollo Manual
**Frontend (Vite + React):**
```bash
cd frontend
npm run dev
```

**Backend (Sincronización Opcional - Spring Boot):**
```bash
.\mvnw.cmd spring-boot:run
```

---

## 💎 Funcionalidades Core

### 📖 World Bible (La Biblia del Mundo)
Gestión jerárquica de entidades (Personajes, Lugares, Objetos, Deidades) mediante plantillas dinámicas y atributos personalizados.
- **Backlinks (Apariciones):** Rastreo automático de menciones de entidades en tus manuscritos (Estilo Obsidian).

### 🕸️ Grafo de Causalidad
Visualización relacional de alta fidelidad para mapear conexiones entre personajes y facciones.
- **Memoria de Cámara:** El grafo recuerda exactamente tu zoom y posición (Viewport Persistence).

### ✍️ Writing Hub (Centro de Escritura)
Entorno de escritura minimalista con gestión de cuadernos y hojas.
- **Snapshots:** Control de versiones local para cada página de tu obra.

### 🕒 Multiverse Timeline
Gestión de líneas temporales paralelas y eventos históricos vinculados a entidades del mapa.

---

## 🛠️ Stack Tecnológico
- **Frontend:** React 18, TypeScript, Vite.
- **Estilo:** Vanilla CSS (Technical Zen / Dark Glassmorphism).
- **Estado:** Zustand (Async Orchestration).
- **Persistencia:** SQLite WASM (SQLocal) + OPFS.
- **Backend:** Spring Boot 3 (Java 21) para servicios de exportación y backup.

---

## 📂 Estructura del Proyecto
```text
WorldbuildingApp/
├── frontend/           # Interfaz de Usuario y Lógica Local-First
│   ├── src/
│   │   ├── application/   # Casos de Uso y Lógica de Negocio
│   │   ├── domain/        # Modelos e Interfaces
│   │   ├── infrastructure/# Persistencia (SQLite) y Repositorios
│   │   ├── presentation/  # Componentes UI (Atoms, Molecules, Layouts)
│   │   └── store/         # Gestión de Estado Global (Zustand)
├── main/               # Backend de Sincronización y Backup (Java)
├── Docs/               # Master Documentation & Architect Logs
└── scripts/            # Herramientas de Refactorización y Automatización
```

---

## 📝 Requisitos
- **Node.js** 18+ (Frontend)
- **Java** 21+ (Backend de Sincronización)
- **Navegador Moderno** (Chrome/Edge/Arc recomendados por soporte OPFS)

---

Developed with 💜 by [Roberto Monedero Alonso](https://github.com/Fixius50)
*"En la red de almas, ningún ser es un desierto."*

---

### 📺 Demo & Vision
<p align="center">
  <a href="https://www.youtube.com/watch?v=FjV8SHjHvHk">
    <img src="https://img.youtube.com/vi/FjV8SHjHvHk/maxresdefault.jpg" alt="Chronos Atlas Demo" width="100%" style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
  </a>
</p>