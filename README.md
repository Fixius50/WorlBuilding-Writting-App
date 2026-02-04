# WorldbuildingApp V2 (Codex Engine)

Aplicación de worldbuilding para crear y gestionar mundos ficticios, enfocada en planificación de historias con una arquitectura multi-inquilino basada en SQLite.

## Requisitos

- **Java 17/21+**
- **Node.js & npm** (para el frontend con Vite)
- **Maven** (incluido via wrapper)

## Arquitectura Multi-Universo (Multi-Tenant)

A diferencia de la V1, esta versión utiliza una base de datos SQLite independiente por cada proyecto.

- Cada proyecto se guarda en `src/main/resources/data/{nombre}.db`.
- El sistema detecta automáticamente nuevos archivos `.db` al arrancar.
- **Seguridad**: El borrado es lógico (Soft Delete) mediante las columnas `deleted` y `deleted_date`.

## Arranque Rápido

1. **Frontend (Vite)**:

   ```powershell
   npm install
   npm run dev
   ```

2. **Backend (Spring Boot)**:

   ```powershell
   ./mvnw clean spring-boot:run
   ```

3. **Acceso**: `http://localhost:5173` (Vite) o `http://localhost:8080` (Producción).

## Características Recientes (Febrero 2025)

### 1. Sistema de Ajustes Reactivo

- **Navegación Superior**: Interfaz de ajustes rediseñada con Top Nav para mayor espacio.
- **Auto-Save**: Los cambios de tema, fuente y selección de sincronización se guardan automáticamente.
- **Notificaciones (Toasts)**: Feedback visual instantáneo para cada cambio mediante micro-animaciones.

### 2. Backup Inteligente

- **Exportación ZIP**: Genera un backup de todas las bases de datos activas en la carpeta `data`.
- **Optimizado**: Excluye carpetas voluminosas (como `Docs`) para descargas instantáneas centradas en los datos del universo.
- **Detección Dinámica**: Localiza automáticamente todos los archivos `.db` del multiverso.

### 3. Migraciones Robustas

- **Parcheado Programático**: `DatabaseMigration.java` incluye un sistema que comprueba la existencia de columnas antes de aplicar Flyway, evitando errores de "Duplicate Column" en SQLite y permitiendo actualizaciones incrementales seguras.

## Estructura del Proyecto

```
WorldbuildingApp/
├── src/main/java/com/worldbuilding/app/
│   ├── config/      # Migraciones dinámicas y multi-tenancy
│   ├── controller/  # Controladores REST (Backup, Universo, etc.)
│   ├── model/       # Entidades con SoftDelete nativo
│   └── service/     # Descubrimiento de proyectos y lógica
├── src/main/resources/
│   ├── data/        # Bases de datos SQLite (*.db)
│   └── db/migration # Scripts Flyway (Estructura base)
└── Docs/            # Manifiestos y documentación técnica
```
