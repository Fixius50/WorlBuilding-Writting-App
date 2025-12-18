# WorldbuildingApp V2

Aplicación de worldbuilding para crear y gestionar mundos ficticios, enfocada en planificación de historias estilo D&D.

## Requisitos

- **Java 24** (o superior)
- **MySQL** (via XAMPP o instalación directa)
- **Maven** (incluido via wrapper)

## Arranque Rápido

1. **Encender MySQL**: Abrir XAMPP y hacer clic en **Start** en MySQL
2. **Ejecutar la app**:
   ```powershell
   cd v2
   ./mvnw spring-boot:run
   ```
3. **Abrir navegador**: `http://localhost:8080`

## Arquitectura

```
v2/
├── src/main/java/com/worldbuilding/app/
│   ├── controller/    # REST Controllers
│   ├── model/         # JPA Entities
│   ├── repository/    # Spring Data Repos
│   └── service/       # Business Logic
└── src/main/resources/
    ├── static/        # Frontend (HTML/CSS/JS)
    └── worldbuilding.sql  # Stored Procedures
```

## Base de Datos

- **Nombre**: `worldbuilding_v2`
- **Auto-creación**: Las tablas se crean automáticamente via Hibernate
- **Procedimientos**: Se cargan desde `worldbuilding.sql`

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/proyectos/crear` | Crear proyecto |
| GET | `/api/proyectos/{nombre}` | Abrir proyecto |
| PUT | `/api/bd/insertar` | Insertar entidad |
| GET | `/api/bd/{tipo}` | Listar por tipo |
| DELETE | `/api/bd/{tipo}/{id}` | Eliminar entidad |
