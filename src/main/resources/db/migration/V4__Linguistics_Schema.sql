-- V4__Linguistics_Schema.sql
-- Schema for the Linguistics Module

-- 1. Conlang
CREATE TABLE IF NOT EXISTS conlang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fonologia TEXT,
    gramatica TEXT,
    font_family_name VARCHAR(255),
    nombre_proyecto VARCHAR(255),
    fecha_creacion TEXT
);

-- 2. Gramatica Rule
CREATE TABLE IF NOT EXISTS gramatica_rule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    conlang_id INTEGER,
    status VARCHAR(50),
    CONSTRAINT fk_rule_conlang FOREIGN KEY (conlang_id) REFERENCES conlang(id)
);

-- 3. Palabra (Diccionario)
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
    CONSTRAINT fk_palabra_conlang FOREIGN KEY (conlang_id) REFERENCES conlang(id)
);

-- 4. Lexemes
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

-- 5. Morphological Rules
CREATE TABLE IF NOT EXISTS conlang_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name VARCHAR(255) NOT NULL,
    regex_pattern VARCHAR(255) NOT NULL,
    replacement_pattern VARCHAR(255) NOT NULL,
    priority INTEGER NOT NULL,
    conlang_id INTEGER,
    CONSTRAINT fk_morph_conlang FOREIGN KEY (conlang_id) REFERENCES conlang(id)
);
