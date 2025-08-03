-- ===========================================
-- PROYECTO: TestProyecto2
-- ENFOQUE: CienciaFiccion
-- FECHA DE CREACIÓN: 2025-08-03T16:47:01.607010
-- ===========================================

-- REFERENCIA A LA BASE DE DATOS GENERAL
-- Este archivo usa worldbuilding.sql como base
-- Las tablas y funciones están definidas en worldbuilding.sql

use worldbuilding;

-- ===========================================
-- OPERACIONES ESPECÍFICAS DEL PROYECTO: TestProyecto2
-- ===========================================

-- Crear el proyecto en la base de datos
INSERT INTO crearProyecto (nombreProyecto, enfoqueProyecto) VALUES ('TestProyecto2', 'CienciaFiccion');

-- ===========================================
-- AQUÍ SE AGREGARÁN LAS OPERACIONES ESPECÍFICAS DEL PROYECTO
-- ===========================================

-- Ejemplos de operaciones que se pueden agregar:
-- INSERT INTO entidadIndividual (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion) VALUES (...);
-- INSERT INTO construccion (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (...);
-- INSERT INTO zona (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (...);
-- INSERT INTO efectos (nombre, apellidos, origen, dureza, comportamiento, descripcion) VALUES (...);
-- INSERT INTO interaccion (nombre, apellidos, direccion, tipo, afectados, descripcion) VALUES (...);

