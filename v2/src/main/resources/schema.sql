-- =====================================================
-- WorldbuildingApp V2 - Schema SQL para H2
-- =====================================================

-- Entidades principales
CREATE TABLE IF NOT EXISTS entidad_individual (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    apellidos VARCHAR(255),
    estado VARCHAR(100),
    tipo VARCHAR(100),
    origen VARCHAR(255),
    comportamiento VARCHAR(255),
    descripcion CLOB,
    es_nodo BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS entidad_colectiva (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    cantidad_miembros INT,
    tipo VARCHAR(100),
    comportamiento VARCHAR(255),
    descripcion CLOB,
    es_nodo BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS zona (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    apellidos VARCHAR(255),
    tamanno VARCHAR(100),
    tipo VARCHAR(100),
    desarrollo VARCHAR(255),
    descripcion CLOB,
    es_nodo BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS construccion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    tipo_edificio VARCHAR(100),
    desarrollo VARCHAR(255),
    descripcion CLOB,
    es_nodo BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS efectos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    tipo_efecto VARCHAR(100),
    origen VARCHAR(255),
    alcance VARCHAR(255),
    descripcion CLOB,
    es_nodo BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS interaccion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto VARCHAR(255),
    nombre VARCHAR(255),
    tipo VARCHAR(100),
    contexto VARCHAR(500),
    resultado VARCHAR(500),
    descripcion CLOB
);

CREATE TABLE IF NOT EXISTS nodo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entidad_id BIGINT NOT NULL,
    tipo_entidad VARCHAR(100) NOT NULL,
    caracteristica_relacional VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS relacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nodo_origen_id BIGINT NOT NULL,
    nodo_destino_id BIGINT NOT NULL,
    tipo_relacion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS proyecto (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_proyecto VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
