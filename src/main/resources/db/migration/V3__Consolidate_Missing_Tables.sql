-- V3__Consolidate_Missing_Tables.sql
-- Missing tables in V1 following WorldbuildingApp model entities

-- 1. Graph Node Positions (Fixes 500 error in /api/world-bible/graph)
CREATE TABLE IF NOT EXISTS nodo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidad_id INTEGER NOT NULL,
    tipo_entidad VARCHAR(50) NOT NULL,
    caracteristica_relacional VARCHAR(255),
    pos_x DOUBLE,
    pos_y DOUBLE
);

-- 2. Zone Registry (Zona.java)
CREATE TABLE IF NOT EXISTS zona (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    apellidos VARCHAR(255),
    tamanno VARCHAR(255),
    tipo VARCHAR(50),
    desarrollo VARCHAR(255),
    descripcion TEXT,
    es_nodo BOOLEAN DEFAULT 0,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT
);

-- 3. Social Interactions (Interaccion.java)
CREATE TABLE IF NOT EXISTS interaccion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    tipo VARCHAR(50),
    contexto VARCHAR(255),
    resultado VARCHAR(255),
    descripcion TEXT,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT
);

-- 4. Architecture and Buildings (Construccion.java)
CREATE TABLE IF NOT EXISTS construccion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    tipo_edificio VARCHAR(50),
    desarrollo VARCHAR(255),
    descripcion TEXT,
    es_nodo BOOLEAN DEFAULT 0,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT
);

-- 5. Abilities and Magic Effects (Efectos.java)
CREATE TABLE IF NOT EXISTS efectos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    tipo_efecto VARCHAR(50),
    origen VARCHAR(255),
    alcance VARCHAR(255),
    descripcion TEXT,
    es_nodo BOOLEAN DEFAULT 0,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT
);

-- 6. Collective Entities and Factions (EntidadColectiva.java)
CREATE TABLE IF NOT EXISTS entidad_colectiva (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    cantidad_miembros INTEGER,
    tipo VARCHAR(50),
    comportamiento TEXT,
    descripcion TEXT,
    es_nodo BOOLEAN DEFAULT 0,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT
);
