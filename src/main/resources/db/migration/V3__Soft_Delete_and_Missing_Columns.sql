-- V3__Soft_Delete_and_Missing_Columns.sql
-- (Idempotent structural changes)
-- Note: Soft delete columns (deleted, deleted_date) for existing tables are handled 
-- programmatically in DatabaseMigration.java to avoid SQLite duplication errors.

-- 1. Create EntidadIndividual if missing
CREATE TABLE IF NOT EXISTS entidad_individual (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_proyecto VARCHAR(255) NOT NULL,
    nombre VARCHAR(255),
    apellidos VARCHAR(255),
    estado VARCHAR(50),
    tipo VARCHAR(50),
    origen VARCHAR(255),
    comportamiento TEXT,
    descripcion TEXT,
    es_nodo BOOLEAN DEFAULT 0,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT
);
