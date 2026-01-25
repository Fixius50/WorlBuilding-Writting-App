-- V1__Initial_Schema.sql
-- Base Schema for WorldbuildingApp V2 (SQLite)

-- 1. Projects (Cuadernos)
CREATE TABLE IF NOT EXISTS cuaderno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_proyecto VARCHAR(255) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50),
    genero VARCHAR(50),
    imagen_url TEXT,
    fecha_creacion TEXT,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT
);

-- 2. Folders (Carpetas)
CREATE TABLE IF NOT EXISTS carpeta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    tipo VARCHAR(50),
    descripcion TEXT,
    padre_id INTEGER,
    proyecto_id INTEGER,
    item_count INTEGER DEFAULT 0,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT,
    CONSTRAINT fk_carpeta_padre FOREIGN KEY (padre_id) REFERENCES carpeta(id),
    CONSTRAINT fk_carpeta_proyecto FOREIGN KEY (proyecto_id) REFERENCES cuaderno(id)
);

-- 3. Entities (EntidadGenerica)
CREATE TABLE IF NOT EXISTS entidad_generica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    proyecto_id INTEGER NOT NULL,
    carpeta_id INTEGER NOT NULL,
    tipo_especial VARCHAR(50),
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT,
    descripcion TEXT,
    tags VARCHAR(255),
    slug VARCHAR(255),
    apariencia TEXT,
    notas TEXT,
    icon_url TEXT,
    color VARCHAR(50),
    categoria VARCHAR(50),
    favorite BOOLEAN DEFAULT 0,
    json_attributes TEXT DEFAULT '{}',
    CONSTRAINT fk_entidad_proyecto FOREIGN KEY (proyecto_id) REFERENCES cuaderno(id),
    CONSTRAINT fk_entidad_carpeta FOREIGN KEY (carpeta_id) REFERENCES carpeta(id)
);

-- 4. Attribute Templates (Plantillas)
CREATE TABLE IF NOT EXISTS atributo_plantilla (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carpeta_id INTEGER,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    metadata TEXT,
    valor_defecto TEXT,
    es_obligatorio BOOLEAN DEFAULT 0,
    global BOOLEAN DEFAULT 0,
    orden_visual INTEGER,
    CONSTRAINT fk_plantilla_carpeta FOREIGN KEY (carpeta_id) REFERENCES carpeta(id)
);

-- 5. Attribute Values (Valores)
CREATE TABLE IF NOT EXISTS atributo_valor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidad_id INTEGER NOT NULL,
    plantilla_id INTEGER NOT NULL,
    valor TEXT,
    CONSTRAINT fk_valor_entidad FOREIGN KEY (entidad_id) REFERENCES entidad_generica(id),
    CONSTRAINT fk_valor_plantilla FOREIGN KEY (plantilla_id) REFERENCES atributo_plantilla(id)
);

-- 6. Writing Module (Hojas & Notas)
CREATE TABLE IF NOT EXISTS hoja (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuaderno_id INTEGER NOT NULL,
    titulo VARCHAR(255),
    contenido TEXT,
    numero INTEGER,
    fecha_modificacion TEXT,
    CONSTRAINT fk_hoja_cuaderno FOREIGN KEY (cuaderno_id) REFERENCES cuaderno(id)
);

CREATE TABLE IF NOT EXISTS nota_rapida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contenido TEXT,
    fecha_creacion TEXT,
    hoja_id INTEGER,
    proyecto_id INTEGER,
    color VARCHAR(50),
    x INTEGER,
    y INTEGER,
    CONSTRAINT fk_nota_hoja FOREIGN KEY (hoja_id) REFERENCES hoja(id)
);

-- 7. Timeline Module
CREATE TABLE IF NOT EXISTS universo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255),
    descripcion TEXT,
    proyecto_id INTEGER,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT,
    CONSTRAINT fk_universo_proyecto FOREIGN KEY (proyecto_id) REFERENCES cuaderno(id)
);

CREATE TABLE IF NOT EXISTS linea_tiempo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    es_raiz BOOLEAN DEFAULT 0,
    universo_id INTEGER,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT,
    CONSTRAINT fk_linea_universo FOREIGN KEY (universo_id) REFERENCES universo(id)
);

CREATE TABLE IF NOT EXISTS evento_tiempo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    linea_tiempo_id INTEGER,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_texto VARCHAR(255),
    orden_absoluto INTEGER,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT,
    CONSTRAINT fk_evento_linea FOREIGN KEY (linea_tiempo_id) REFERENCES linea_tiempo(id)
);
