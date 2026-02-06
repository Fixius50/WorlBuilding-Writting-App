-- V1__Initial_Schema.sql
-- Consolidated Schema for WorldbuildingApp V2 (SQLite)
-- Includes Tables from V1, V2, V3, V4, V5 and fixes for missing columns

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
    descripcion TEXT,
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
    -- Columns previously added by manual patch
    numero_pagina INTEGER,
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT,
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
    -- Columns previously added by manual patch
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT,
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

-- 8. Relacion (From V2)
CREATE TABLE IF NOT EXISTS relacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nodo_origen_id INTEGER NOT NULL,
    nodo_destino_id INTEGER NOT NULL,
    tipo_relacion VARCHAR(50),
    tipo_origen VARCHAR(50),
    tipo_destino VARCHAR(50),
    descripcion TEXT,
    metadata TEXT,
    -- Columns previously added by manual patch
    deleted BOOLEAN DEFAULT 0,
    deleted_date TEXT
);

-- 9. Entidad Individual (From V3)
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

-- 10. Linguistics Module (From V4 & V5)
-- Conlang
CREATE TABLE IF NOT EXISTS conlang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fonologia TEXT,
    gramatica TEXT,
    font_family_name VARCHAR(255),
    nombre_proyecto VARCHAR(255),
    fecha_creacion TEXT,
    -- From V5 / Manual Patch
    font_binary BLOB
);

-- Gramatica Rule
CREATE TABLE IF NOT EXISTS gramatica_rule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    conlang_id INTEGER,
    status VARCHAR(50),
    CONSTRAINT fk_rule_conlang FOREIGN KEY (conlang_id) REFERENCES conlang(id)
);

-- Palabra (Diccionario)
CREATE TABLE IF NOT EXISTS palabra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conlang_id INTEGER,
    lema VARCHAR(255),
    ipa VARCHAR(255),
    definicion TEXT,
    categoria_gramatical VARCHAR(50),
    notas TEXT,
    svg_path_data TEXT,
    raster_image_path TEXT,
    -- From V5 / Manual Patch
    unicode_code VARCHAR(20),
    CONSTRAINT fk_palabra_conlang FOREIGN KEY (conlang_id) REFERENCES conlang(id)
);

-- Lexemes
CREATE TABLE IF NOT EXISTS conlang_lexemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gloss VARCHAR(255) NOT NULL,
    description TEXT,
    ipa_pronunciation VARCHAR(255) NOT NULL,
    svg_path_data TEXT,
    raster_image_path TEXT,
    project_id INTEGER,
    created_at TEXT,
    CONSTRAINT fk_lexeme_project FOREIGN KEY (project_id) REFERENCES cuaderno(id)
);

-- Morphological Rules
CREATE TABLE IF NOT EXISTS conlang_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name VARCHAR(255) NOT NULL,
    regex_pattern VARCHAR(255) NOT NULL,
    replacement_pattern VARCHAR(255) NOT NULL,
    priority INTEGER NOT NULL,
    conlang_id INTEGER,
    CONSTRAINT fk_morph_conlang FOREIGN KEY (conlang_id) REFERENCES conlang(id)
);
